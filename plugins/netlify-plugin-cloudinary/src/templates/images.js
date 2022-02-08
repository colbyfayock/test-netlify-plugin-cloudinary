const { getCloudinary, getCloudinaryUrl } = require('../lib/cloudinary');
const { getQueryParams } = require('../lib/util');

exports.handler = async function(event, context) {
  const { rawUrl } = event;
  const pathSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = pathSegments[0];
  const imagePath = `/images${pathSegments[1]}`;

  const { deliveryType, uploadPreset } = getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;
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

  const cloudinaryUrl = await getCloudinaryUrl({
    deliveryType,
    path: path.join(CLOUDINARY_IMAGES_PATH, ':image'),
    uploadPreset,
    remoteHost: `${endpoint}${imagePath}`
  });

  return {
    statusCode: 302,
    headers: event.headers,
    Location: cloudinaryUrl
  }
}