
const fs = require('fs-extra')
const path = require('path');
const glob = require('glob');

const { getCloudinary, updateHtmlImagesToCloudinary, getCloudinaryUrl } = require('./lib/cloudinary');

const CLOUDINARY_ASSET_PATH = "/cloudinary-assets";
const CLOUDINARY_IMAGES_PATH = `${CLOUDINARY_ASSET_PATH}/images`;

/**
 * TODO
 * - Handle srcset
 * - Delivery type for redirect via Netlify redirects
 */

module.exports = {

  async onPreBuild({ netlifyConfig, constants, inputs }) {
    console.log('constants', constants);
    console.log('inputs', inputs);
    const { PUBLISH_DIR } = constants;
    const { uploadPreset } = inputs;

    const srcImagePath = path.join(PUBLISH_DIR, 'images');
    const cldImagePath = path.join(PUBLISH_DIR, CLOUDINARY_IMAGES_PATH);

    console.log('srcImagePath', srcImagePath)
    console.log('cldImagePath', cldImagePath)

    // await fs.mkdir(cldImagePath, { recursive: true });
    // await fs.copy(srcImagePath, cldImagePath);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      throw new Error('Cloudinary Cloud Name required. Please use environment variable CLOUDINARY_CLOUD_NAME');
    }

    getCloudinary({
      cloudName,
      apiKey,
      apiSecret
    });

    const cloudinarySrc = await getCloudinaryUrl({
      deliveryType: 'fetch',
      path: path.join(CLOUDINARY_IMAGES_PATH, ':image'),
      uploadPreset,
      remoteHost: process.env.DEPLOY_PRIME_URL
    });

    console.log('cloudinarySrc', cloudinarySrc)
    console.log('path.join(CLOUDINARY_IMAGES_PATH, :image)', path.join(CLOUDINARY_IMAGES_PATH, ':image'))

    netlifyConfig.redirects.push({
      from: path.join(CLOUDINARY_IMAGES_PATH, ':image'),
      to: cloudinarySrc,
      status: 301,
      force: true
    });
  },

  async onPostBuild({ constants, inputs }) {
    const { PUBLISH_DIR } = constants;
    const {
      deliveryType,
      uploadPreset,
      folder = process.env.SITE_NAME
    } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      throw new Error('Cloudinary Cloud Name required. Please use environment variable CLOUDINARY_CLOUD_NAME');
    }

    const cloudinary = getCloudinary({
      cloudName,
      apiKey,
      apiSecret
    });

    // Find all HTML source files in the publish directory

    const pages = glob.sync(`${PUBLISH_DIR}/**/*.html`);

    const results = await Promise.all(pages.map(async page => {
      const sourceHtml = await fs.readFile(page, 'utf-8');

      const { html, errors } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType,
        uploadPreset,
        folder,
        localDir: PUBLISH_DIR,
        remoteHost: process.env.DEPLOY_PRIME_URL
      });

      await fs.writeFile(page, html);

      return {
        page,
        errors
      }
    }));




    const srcImagePath = path.join(PUBLISH_DIR, 'images');
    const cldImagePath = path.join(PUBLISH_DIR, CLOUDINARY_IMAGES_PATH);

    console.log('srcImagePath', srcImagePath)
    console.log('cldImagePath', cldImagePath)

    await fs.mkdir(cldImagePath, { recursive: true });
    await fs.copy(srcImagePath, cldImagePath);





    const errors = results.filter(({ errors }) => errors.length > 0);

    if ( errors.length > 0) {
      console.log(`Done with ${errors.length} errors...`);
      console.log(JSON.stringify(errors, null, 2));
    } else {
      console.log('Done.');
    }
  }

}