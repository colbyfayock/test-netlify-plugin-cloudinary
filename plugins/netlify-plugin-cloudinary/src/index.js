
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

  async onBuild({ netlifyConfig, constants, inputs }) {
    const { PUBLISH_DIR, FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC } = constants;
    const { uploadPreset } = inputs;

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

    console.log('constants', constants);

    const name = 'cld_images';
    const functionsPath = INTERNAL_FUNCTIONS_SRC || FUNCTIONS_SRC;
    const functionName = `${name}.js`;
    console.log('name', name);
    console.log('functionsPath', functionsPath);
    console.log('functionName', functionName);
    const functionDirectory = path.join(functionsPath, name);

    console.log('process.cwd()', process.cwd())
    console.log('__dirname', __dirname)

    try {
      console.log('copying');
      await fs.copy(path.join(__dirname, 'templates/images.js'), path.join(functionDirectory, functionName));
    } catch(e) {
      console.log('e', e);
    }

    const params = {
      image: ':image',
      deliveryType: 'fetch',
      cloudName
    }

    const paramsString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

    netlifyConfig.redirects.push({
      from: path.join('/images/', ':image'),
      to: `${process.env.DEPLOY_PRIME_URL}/${path.join('.netlify', 'functions', name, ':image')}?${paramsString}`,
      status: 302,
      force: true
    });

    // const srcImagePath = path.join(PUBLISH_DIR, 'images');
    // const cldImagePath = path.join(PUBLISH_DIR, CLOUDINARY_IMAGES_PATH);
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

    // Copy assets into separate directory

    // const srcImagePath = path.join(PUBLISH_DIR, 'images');
    // const cldImagePath = path.join(PUBLISH_DIR, CLOUDINARY_IMAGES_PATH);

    // try {
    //   await fs.mkdir(cldImagePath, { recursive: true });
    //   await fs.copy(srcImagePath, cldImagePath);
    // } catch(e) {

    // }


    const errors = results.filter(({ errors }) => errors.length > 0);

    if ( errors.length > 0) {
      console.log(`Done with ${errors.length} errors...`);
      console.log(JSON.stringify(errors, null, 2));
    } else {
      console.log('Done.');
    }
  }

}