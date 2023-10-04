async function getTextFromElement(page, selector){
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    return element ? element.textContent : null;
  }, selector);
}

async function submitFormData(page,url, formData){
  return page.evaluate((url, formData) => {
    // Modify this code to create and submit the form dynamically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url; // Replace with the target URL
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      }
    }
    document.body.appendChild(form);
    form.submit();
  }, url, formData);
}

async function extractFormData(page, formSelector){
  return page.$$eval(formSelector, (forms) => {
    // Extract form data as an object (modify this as per your form structure)
    const data = {};
    for (const form of forms) {
      for (const field of form.elements) {
        if (field.name) {
          data[field.name] = field.value;
        }
      }
    }
    return data;
  });
}

async function extractTable(page, tableSelector){
  return await page.evaluate((selector) => {
    const table = document.querySelector(selector);
    const headers = Array.from(table.querySelectorAll('thead th')).map((header) =>
      header.textContent.trim() ? header.textContent.trim().replace(/\s+/g, '_') : ''
    );
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    return rows.map((row) => {
      const rowData = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent.trim());
      const rowObject = {};

      headers.forEach((header, index) => {
        if (header !== '') {
          rowObject[header] = rowData[index];
        }
      });

      return rowObject;
    });
  }, tableSelector);
}

async function addAttributeToElement(page, selector, attrName, attrValue){
  return page.evaluate((selector, attrName, attrValue) => {
    const formElement = document.querySelector(selector);
    if(formElement){
      formElement.setAttribute(attrName, attrValue);
    }
  }, selector, attrName, attrValue);
}

async function removeElement(page, elementSelector){
  return page.evaluate((selector) => {
    const elementToRemove = document.querySelector(selector);
    if (elementToRemove) {
      elementToRemove.remove();
    }
  }, elementSelector);
}
async function getSelectValues(page, selectSelector){
  return page.evaluate((selector) => {
    const selectElement = document.querySelector(selector);
    const optionElements = Array.from(selectElement.options);
    return optionElements.map((option) => option.value);
  }, selectSelector);
}
async function tungguLoadingSelesai(page, selector){
    return page.waitForFunction(
        (selector) => {
            const element = document.querySelector(selector);
            return element && !element.textContent.trim().toLocaleLowerCase().includes('loading');
        },
        { polling: 'raf' }, // Use 'raf' for smoother checking
        selector
    );
}

async function getAllIdAsalKeberangkatanByKeWord(page, keyword = ""){
    let listId = [];
    await page.waitForSelector('#select2-ticket_org-container');
    await page.click('#select2-ticket_org-container');

    await page.waitForSelector(".select2-search__field");
    await page.type(".select2-search__field", keyword);

    try {
        // Find the parent element
        const parentElement = await page.$("#select2-ticket_org-results");
    
        if (parentElement) {
          // Get a list of child elements matching the child selector
          const childElements = await parentElement.$$("li");

          if (childElements.length > 0) {
            daftarAsalPapuaTersedia = childElements;
            // Loop through child elements and do something with them
            for (const childElement of childElements) {
                const idProperty = await childElement.getProperty("id");
                const idValue = await idProperty.jsonValue();
                const idSplit =  idValue.split("-");
                listId.push(idSplit[idSplit.length - 1]);
            }
          } else {
            console.log('No child elements found.');
          }
        } else {
          console.log('Parent element not found.');
        }
      } catch (error) {
        console.error('Error fetching child elements:', error);
    }

    await page.click('#select2-ticket_org-container');
    return listId;
}

async function getAllIdTujuanKeberangkatanByKeWord(page, keyword = ""){
    let listId = [];
    await page.waitForSelector('#select2-ticket_des-container');
    await page.click('#select2-ticket_des-container');

    await page.waitForSelector(".select2-search__field");
    await page.type(".select2-search__field", keyword);

    try {
        // Find the parent element
        const parentElement = await page.$("#select2-ticket_des-results");
    
        if (parentElement) {
          // Get a list of child elements matching the child selector
          const childElements = await parentElement.$$("li");

          if (childElements.length > 0) {
            daftarAsalPapuaTersedia = childElements;
            // Loop through child elements and do something with them
            for (const childElement of childElements) {
                const idProperty = await childElement.getProperty("id");
                const idValue = await idProperty.jsonValue();
                const idSplit =  idValue.split("-");
                listId.push(idSplit[idSplit.length - 1]);
            }
          } else {
            console.log('No child elements found.');
          }
        } else {
          console.log('Parent element not found.');
        }
      } catch (error) {
        console.error('Error fetching child elements:', error);
    }

    await page.click('#select2-ticket_des-container');
    return listId;
}

async function pilihAsalKeberangkatanFromId(page, id){
    await page.waitForSelector('#select2-ticket_org-container');
    await page.click('#select2-ticket_org-container');

    const elementSelector = `[id^="select2-ticket_org"][id$="${id}"]`;
    try {
        // Wait for the element to appear on the page
        await page.waitForSelector(elementSelector, { visible: true, timeout: 10000 });

        await delay(500);
        // Click the element
        await page.click(elementSelector);

        return true;
    } catch (error) {
        console.error(`Element with ID pattern (${id}) not found or could not be clicked:`);
        return false;
    }
}

async function getAllListTujuan(page){
    let listId = [];
    await page.waitForSelector('#select2-ticket_des-container');
    await page.click('#select2-ticket_des-container');

    try {
        // Find the parent element
        const parentElement = await page.$("#select2-ticket_des-results");
    
        if (parentElement) {
          // Get a list of child elements matching the child selector
          const childElements = await parentElement.$$("li");

          if (childElements.length > 0) {
            daftarAsalPapuaTersedia = childElements;
            // Loop through child elements and do something with them
            for (const childElement of childElements) {
                const idProperty = await childElement.getProperty("id");
                const idValue = await idProperty.jsonValue();
                const idSplit =  idValue.split("-");
                listId.push(idSplit[idSplit.length - 1]);
            }
          } else {
            console.log('No child elements found.');
          }
        } else {
          console.log('Parent element not found.');
        }
      } catch (error) {
        console.error('Error fetching child elements:', error);
    }

    await page.click('#select2-ticket_des-container');
    return listId;
}

async function pilihTujuanKeberangkatanFromId(page, id){
    await page.waitForSelector('#select2-ticket_des-container');
    await page.click('#select2-ticket_des-container');

    const elementSelector = `[id^="select2-ticket_des"][id$="${id}"]`;
    try {
        // Wait for the element to appear on the page
        await page.waitForSelector(elementSelector, { visible: true, timeout: 10000 });

        await delay(500);
        // Click the element
        await page.click(elementSelector);

        // console.log(`Element with ID pattern (${id}) found and clicked.`);
        return true;
    } catch (error) {
        console.error('Element not found or could not be clicked:', error);
        return false;
    }
}

async function delay(time){
    return new Promise((r)=> setTimeout(r, time));
}

async function scrollToViewAndClick(page, selector){
  await page.evaluate(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView();
    }
  }, selector);

  await page.click(selector); 
}


module.exports = {
    getTextFromElement,
    submitFormData,
    extractFormData,
    extractTable,
    addAttributeToElement,
    removeElement,
    getSelectValues,
    tungguLoadingSelesai,
    getAllIdAsalKeberangkatanByKeWord,
    getAllIdTujuanKeberangkatanByKeWord,
    pilihAsalKeberangkatanFromId,
    getAllListTujuan,
    pilihTujuanKeberangkatanFromId,
    delay,
    scrollToViewAndClick
}