import { test, expect } from '@playwright/test';

test('test_dataloop_studio', async ({ page }) => {
  // open dataloop web login page
  await page.goto('https://console.dataloop.ai/?iss=https%3A%2F%2Fdataloop-production.auth0.com%2F');
  await page.goto('https://console.dataloop.ai/welcome?redirect=%2Fprojects%3Fiss%3Dhttps%253A%252F%252Fdataloop-production.auth0.com%252F');
  
  // login to dataloop platform
  await page.getByRole('button', { name: 'Sign Up / Login' }).click();
  await page.getByPlaceholder('yours@example.com').fill('danny.lavon@gmail.com');
  await page.getByPlaceholder('your password').click();
  await page.getByPlaceholder('your password').fill('Test4work!');
  await page.locator('button[name="submit"]').click();

  // go to Projects
  await page.getByRole('button', { name: 'Go to project' }).click();

  // go to Dataset
  await page.getByRole('button', { name: 'browse' }).click();

  // open the pre-loaded image 
  // ***
  // *** double click periodically fails. could not understand why. alternative way would be to right-click on the image and open the studio in a new tab
  // *** in such a case need to replace dblclick with the following code and use page1 for the statements afterwards
  // *** I prefer the dblclick
  // ***
  // *** await page.getByRole('table').getByRole('button').click({
  // *** button: 'right'
  // *** });
  // *** const page1Promise = page.waitForEvent('popup');
  // *** await page.getByText('Open in new tab (Studio)').click();
  // *** const page1 = await page1Promise;
  // ***
  await page.locator('html').click();
  await page.getByRole('table').getByRole('button').dblclick();

// Delete previuos annotations if exist
// ***
// *** could not figure out how to sample that there are no annotations
// *** below is suggestion that I thougt might work, but it's not working
// *** left the code just to show that I tried, but it is marked in order not to fail the next steps
// ***
//await page.getByText('All Annotations').click();
//if (await page.locator('.annotations-actions > div > div:nth-child(4) > .q-btn').isVisible){
//    await page.locator('.annotations-actions > div > div:nth-child(4) > .q-btn').click();
//    await page.getByRole('button', { name: 'yes' }).click();
//}

  // Get image meta-data
  await page.getByRole('tab', { name: 'ITEM' }).getByText('ITEM').click();
  await page.getByRole('button', { name: 'Expand' }).getByRole('button').first().click();
  const img_properties=await page.locator('.ace_content').textContent();
  //await page.locator('.ace_content').click();
  await page.locator('textarea').press('Escape');

  // Get image dimensions from meta-data
  var img_height = "";
  var img_width = "";
  var img_size = "";
  var current_attr = "";
  let build_attr: boolean = false

  // scan the text file and extract the data on: size, height, width
  for (let i=0; i < img_properties.length; i++)
  {
      if (img_properties[i]=='\"' && build_attr==false)
      {
        build_attr=true;
        i++;
      }

      // during scaning extract the values when you to: size, height, width
      while (build_attr) 
      {
        current_attr = current_attr+img_properties[i];
        i++;
        if (img_properties[i]=='\"')
        {
          build_attr=false;
          switch(current_attr) 
          {
            case "size":
              i=i+3;
              while (img_properties[i] != ',')
              {
                img_size=img_size+img_properties[i];
                i++;
              }
              break;
            case "height":
              i=i+3;
              while (img_properties[i] != ',')
              {
                img_height=img_height+img_properties[i];
                i++;
              }
              break;
            case "width":
              i=i+3;
              while (img_properties[i] != ' ')
              {
                img_width=img_width+img_properties[i];
                i++;
              }
              break;
          }    
          current_attr="";
        }
      } 
    }
 
  // Calculate box bounderies
  let img_size_num = +img_size;
  let img_height_num = +img_height;
  let img_width_num = +img_width;
  var box_size_height: number = img_height_num / 2;
  var box_size_width = img_width_num / 2;
  var box_start_point_height = img_height_num / 4;
  var box_start_point_width = img_width_num / 4;
  var box_end_point_hight = box_start_point_height + box_size_height;
  var box_end_point_width = box_start_point_width + box_size_width;

  // select box annotation
  await page.locator('div:nth-child(4) > .dl-btn > .q-btn').first().click();

  // select box boundries on the image
  await page.locator('#box_container canvas').nth(1).click({
    position: {
      x: box_start_point_width,
      y: box_start_point_height
    }
  });
  await page.locator('#box_container canvas').nth(1).click({
    position: {
      x: box_end_point_width,
      y: box_end_point_hight
    }
  });

  // save box annotation
  await page.locator('.save-btn > .q-btn').click();
  await page.getByText('All Annotations (1)').click();

  // Check image size is correct
  // *** not sure to what value to compare the extracted image size
  // *** marked the following code section as it has no meaning
  // ***
  //if(img_size_num != ???){
  //  console.log("The size of the image is not correct: "+img_size_num);
  //} else {
  //  console.log("The size of the image is correct: "+img_size_num)
  //}

});