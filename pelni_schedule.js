const puppeteer = require("./puppeteer-extensions");
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({headless:false, timeout:120000});
    const page = await browser.newPage();

    let direction;
    let key; 

    try {
        const direction_parameter = process.argv[2];
        const key_parameter = process.argv[3];

        if(!direction_parameter || !["from", "to"].includes(direction_parameter)){
            throw new Error(`Error: Parmaeter Yang dimasukkan salah harus di antara "from" atau "to", node pelni_schedule from|to papua`);
        }

        if(!key_parameter) {
            throw new Error(`Error: Kekurangan Argumen lokasi, ex : node pelni_schedule from papua`);
        }

        direction = direction_parameter;
        key = key_parameter;
    } catch (error) {
        console.error(error.message)
        process.exit();
    }


    let listJadwal = [];
  // Your scraping logic goes here
    await page.goto('https://www.pelni.co.id/reservasi-tiket');

    await page.waitForSelector('body');

    await page.removeElement( ".loader-popup");

    await page.addAttributeToElement("form","target","_blank");

    await page.select("#ticket_male", "1");

    await page.scrollToViewAndClick( "#NoIconDemo");
    await page.click(".ui-state-default.ui-state-highlight");

    await page.tungguLoadingSelesai( "#ticket_class");
    await page.delay(500);
    await page.click(".swal-button-container .swal-button.swal-button--confirm");
    await page.delay(1000);

    const listId = await page.getAllIdAsalKeberangkatanByKeWord(direction === "from" ? key : "");

    for (let index = 0; index < listId.length; index++) {
        if(listId[index] == "") continue;
        const success = await page.pilihAsalKeberangkatanFromId( listId[index])
        if(!success) return;

        await page.tungguLoadingSelesai( "#select2-ticket_des-container");

        const origin = await page.getTextFromElement( "#select2-ticket_org-container");
        console.log(`origin ${index + 1} out of ${listId.length}`);
        console.log(`Origin => ${origin}`);

        const getListIdTujuan = await page.getAllIdTujuanKeberangkatanByKeWord(direction === "to" ? key : "");
        const listIdTujuan = getListIdTujuan.filter(i=> i !== '');
        if(listIdTujuan.length > 0){
            for (let indexTujuan = 0; indexTujuan < listIdTujuan.length; indexTujuan++) {
                // if(indexTujuan+1 < 18) continue;
                if(listIdTujuan[indexTujuan] == "") continue;
                await page.pilihTujuanKeberangkatanFromId( listIdTujuan[indexTujuan])
                await page.tungguLoadingSelesai( "#ticket_class");
                await page.delay(500);

                const destination = await page.getTextFromElement( "#select2-ticket_des-container");
                console.log(`|__Destination (${indexTujuan + 1} out of ${listIdTujuan.length}) => ${destination}`)

                const button = await page.waitForSelector(".swal-button-container .swal-button.swal-button--confirm", {timeout:1000});
                if(button) {
                  await page.click(".swal-button-container .swal-button.swal-button--confirm");
                  await page.delay(1000);
                }
                const listKelasKapal = await page.getSelectValues( "#ticket_class");
                if(listKelasKapal.length > 1){
                  await page.select('#ticket_class', listKelasKapal[1]);

                  const formData = await page.extractFormData( "form");

                  const newPage = await browser.newPage();

                  await newPage.submitFormData('https://www.pelni.co.id/reservasi-tiket' , formData);

                  await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
                  await page.delay(2000);
                  const data = await newPage.extractTable("#example");

                  const new_data = data.map((d) => {
                    const regex_berangkat = /(\d\d:\d\d)(.*)Detail Harga/;
                    const match_berangkat =  regex_berangkat.exec(d.Berangkat)
                    const text_berangkat = `${match_berangkat[2]} - ${match_berangkat[1]}`;

                    const regex_sampai = /(\d\d:\d\d)(.*)/;
                    const match_sampai =  regex_sampai.exec(d.Sampai)
                    const text_sampai = `${match_sampai[2]} - ${match_sampai[1]}`;

                    const regex_lama = /(.*)(transit|langsung)/;
                    const match_lama =  regex_lama.exec(d.Lama_Perjalanan)
                    const text_lama =  `${match_lama[1]}`;
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

                  console.log(`  |__found ${uniqueData.length} schedules`);
                  console.log("_________________________________________________");
                  if(data.length > -1) listJadwal.push(...uniqueData);
                  await newPage.close();
                  await page.bringToFront();

                  const jsonData = JSON.stringify(listJadwal, null, 2);

                  fs.writeFileSync(`${direction}_${key}.json`, jsonData);
                }else{
                  console.log(`  |__"Kelas Kapal" does not exists in this travel, ...skipping`);
                  console.log("___________________________________________________________");
                }
            }
        }else{
          console.log(`Destination => Destination does not exist from this origin `)
          console.log("_____________________________________________________________");
        }
        // await page.delay(2000);
    }

    const jsonData = JSON.stringify(listJadwal, null, 2);
    fs.writeFileSync(`${direction}_${key}.json`, jsonData);
    await page.close();

})();
