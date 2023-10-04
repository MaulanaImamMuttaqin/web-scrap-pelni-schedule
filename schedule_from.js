const puppeteer = require('puppeteer');
const {
    getTextFromElement,
    submitFormData,
    extractFormData,
    extractTable,
    addAttributeToElement,
    removeElement,
    getSelectValues,
    tungguLoadingSelesai,
    getAllIdAsalKeberangkatanByKeWord,
    pilihAsalKeberangkatanFromId,
    getAllListTujuan,
    pilihTujuanKeberangkatanFromId,
    delay,
    scrollToViewAndClick
}  = require("./schedule_module");

const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    const key_parameter = process.argv[2];
    if(!key_parameter) {
      console.error(`Error: Kekurangan Argumen, ex : node schedule_from papua`)
    }
    const key = key_parameter;
    let listJadwal = [];
  // Your scraping logic goes here
    await page.goto('https://www.pelni.co.id/reservasi-tiket');

    await page.waitForSelector('body');

    await removeElement(page, ".loader-popup");

    await addAttributeToElement(page,"form","target","_blank");

    await page.select("#ticket_male", "1");

    await scrollToViewAndClick(page, "#NoIconDemo");
    await page.click(".ui-state-default.ui-state-highlight");

    

    await tungguLoadingSelesai(page, "#ticket_class");
    await delay(500);
    await page.click(".swal-button-container .swal-button.swal-button--confirm");
    await delay(1000);

    const listId = await getAllIdAsalKeberangkatanByKeWord(page, key);

    for (let index = 0; index < listId.length; index++) {
        const success = await pilihAsalKeberangkatanFromId(page, listId[index])
        if(!success) return;

        await tungguLoadingSelesai(page, "#select2-ticket_des-container");

        const listIdTujuan = await getAllListTujuan(page);

        if(listIdTujuan.length > 0){
            for (let indexTujuan = 0; indexTujuan < listIdTujuan.length; indexTujuan++) {
                console.log(`origin ${index + 1} out of ${listId.length} / destination ${indexTujuan + 1} out of ${listIdTujuan.length}`)
                if(listIdTujuan[indexTujuan] == "") continue;
                await pilihTujuanKeberangkatanFromId(page, listIdTujuan[indexTujuan])
                await tungguLoadingSelesai(page, "#ticket_class");
                await delay(500);
                const button = await page.waitForSelector(".swal-button-container .swal-button.swal-button--confirm", {timeout:1000});
                if(button) {
                  await page.click(".swal-button-container .swal-button.swal-button--confirm");
                  await delay(1000);
                }
                const listKelasKapal = await getSelectValues(page, "#ticket_class");
                if(listKelasKapal.length > 1){
                  await page.select('#ticket_class', listKelasKapal[1]);

                  const origin = await getTextFromElement(page, "#select2-ticket_org-container");
                  const destination = await getTextFromElement(page, "#select2-ticket_des-container");
                  const formData = await extractFormData(page, "form");

                  const newPage = await browser.newPage();

                  await submitFormData(newPage,'https://www.pelni.co.id/reservasi-tiket' , formData);

                  await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });

                  const data = await extractTable(newPage, "#example");
                  console.log(data);
                  const new_data = data.map((d) => {
                    const regex_berangkat = /(\d\d:\d\d)(.*)Detail Harga/;
                    const match_berangkat =  regex_berangkat.exec(d.Berangkat)
                    const text_berangkat = `${match_berangkat[2]} - ${match_berangkat[1]}`;

                    const regex_sampai = /(\d\d:\d\d)(.*)/;
                    const match_sampai =  regex_sampai.exec(d.Sampai)
                    const text_sampai = `${match_sampai[2]} - ${match_sampai[1]}`;

                    const regex_lama = /(.*)transit/;
                    const match_lama =  regex_lama.exec(d.Lama_Perjalanan)
                    const text_lama = `${match_lama[1]}`;
                    return {
                      origin,
                      destination,
                      kapal : d.Kapal,
                      berangkat : text_berangkat,
                      sampai : text_sampai,
                      lama_waktu : text_lama
                    }
                  })

                  const uniqueObjects = new Map();
                  new_data.forEach((item) => {
                    const key = item.berangkat;
                    if (!uniqueObjects.has(key)) {
                      uniqueObjects.set(key, item); // Add the object to the Map with the key
                    }
                  });

                  const uniqueData = [...uniqueObjects.values()];

                  console.log(uniqueData)
                  if(data.length > -1) listJadwal.push(...uniqueData);
                  await newPage.close();
                  await page.bringToFront();

                  const jsonData = JSON.stringify(listJadwal, null, 2);
                  fs.writeFileSync("dari_" + key + ".json", jsonData);
                }
            }
        }
        // await delay(2000);
    }

    const jsonData = JSON.stringify(listJadwal, null, 2);
    fs.writeFileSync(key + ".json", jsonData);
    await page.close();

})();
