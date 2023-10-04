const puppeteer = require("puppeteer");
puppeteer.Page.prototype.getTextFromElement = async function ( selector){
  return await this.evaluate((selector) => {
    const element = document.querySelector(selector);
    return element ? element.textContent : null;
  }, selector);
}

puppeteer.Page.prototype.submitFormData = async function (url, formData){
  return this.evaluate((url, formData) => {
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

puppeteer.Page.prototype.extractFormData = async function ( formSelector){
  return this.$$eval(formSelector, (forms) => {
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

puppeteer.Page.prototype.extractTable = async function ( tableSelector){
  return await this.evaluate((selector) => {
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

puppeteer.Page.prototype.addAttributeToElement = async function ( selector, attrName, attrValue){
  return this.evaluate((selector, attrName, attrValue) => {
    const formElement = document.querySelector(selector);
    if(formElement){
      formElement.setAttribute(attrName, attrValue);
    }
  }, selector, attrName, attrValue);
}

puppeteer.Page.prototype.removeElement = async function ( elementSelector){
  return this.evaluate((selector) => {
    const elementToRemove = document.querySelector(selector);
    if (elementToRemove) {
      elementToRemove.remove();
    }
  }, elementSelector);
}
puppeteer.Page.prototype.getSelectValues = async function ( selectSelector){
  return this.evaluate((selector) => {
    const selectElement = document.querySelector(selector);
    const optionElements = Array.from(selectElement.options);
    return optionElements.map((option) => option.value);
  }, selectSelector);
}
puppeteer.Page.prototype.tungguLoadingSelesai = async function ( selector){
    return this.waitForFunction(
        (selector) => {
            const element = document.querySelector(selector);
            return element && !element.textContent.trim().toLocaleLowerCase().includes('loading');
        },
        { polling: 'raf' }, // Use 'raf' for smoother checking
        selector
    );
}

puppeteer.Page.prototype.getAllIdAsalKeberangkatanByKeWord = async function ( keyword = ""){
    let listId = [];
    await this.waitForSelector('#select2-ticket_org-container');
    await this.click('#select2-ticket_org-container');

    await this.waitForSelector(".select2-search__field");
    await this.type(".select2-search__field", keyword);

    try {
        // Find the parent element
        const parentElement = await this.$("#select2-ticket_org-results");
    
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

    await this.click('#select2-ticket_org-container');
    return listId;
}

puppeteer.Page.prototype.getAllIdTujuanKeberangkatanByKeWord = async function ( keyword = ""){
    let listId = [];
    await this.waitForSelector('#select2-ticket_des-container');
    await this.click('#select2-ticket_des-container');

    await this.waitForSelector(".select2-search__field");
    await this.type(".select2-search__field", keyword);

    try {
        // Find the parent element
        const parentElement = await this.$("#select2-ticket_des-results");
    
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

    await this.click('#select2-ticket_des-container');
    return listId;
}

puppeteer.Page.prototype.pilihAsalKeberangkatanFromId = async function ( id){
    await this.waitForSelector('#select2-ticket_org-container');
    await this.click('#select2-ticket_org-container');

    const elementSelector = `[id^="select2-ticket_org"][id$="${id}"]`;
    try {
        // Wait for the element to appear on the this
        await this.waitForSelector(elementSelector, { visible: true, timeout: 10000 });

        await this.delay(500);
        // Click the element
        await this.click(elementSelector);

        return true;
    } catch (error) {
        console.error(`Element with ID pattern (${id}) not found or could not be clicked:`, error);
        return false;
    }
}

puppeteer.Page.prototype.getAllListTujuan = async function (){
    let listId = [];
    await this.waitForSelector('#select2-ticket_des-container');
    await this.click('#select2-ticket_des-container');

    try {
        // Find the parent element
        const parentElement = await this.$("#select2-ticket_des-results");
    
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

    await this.click('#select2-ticket_des-container');
    return listId;
}

puppeteer.Page.prototype.pilihTujuanKeberangkatanFromId = async function ( id){
    await this.waitForSelector('#select2-ticket_des-container');
    await this.click('#select2-ticket_des-container');

    const elementSelector = `[id^="select2-ticket_des"][id$="${id}"]`;
    try {
        // Wait for the element to appear on the this
        await this.waitForSelector(elementSelector, { visible: true, timeout: 10000 });

        await this.delay(500);
        // Click the element
        await this.click(elementSelector);

        // console.log(`Element with ID pattern (${id}) found and clicked.`);
        return true;
    } catch (error) {
        console.error('Element not found or could not be clicked:', error);
        return false;
    }
}

puppeteer.Page.prototype.delay = async function (time){
    return new Promise((r)=> setTimeout(r, time));
}

puppeteer.Page.prototype.scrollToViewAndClick = async function ( selector){
  await this.evaluate(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView();
    }
  }, selector);

  await this.click(selector); 
}

module.exports =  puppeteer;