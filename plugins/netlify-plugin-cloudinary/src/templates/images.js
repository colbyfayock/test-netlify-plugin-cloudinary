exports.handler = async function (event, context) {
  const { rawUrl } = event;
  const pathSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = pathSegments[0];
  const imagePath = `/images${pathSegments[1]}`;

  const { deliveryType, uploadPreset } = getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;

  const remoteUrl = `${endpoint}${imagePath}`;
  const cloudinaryUrl = `https://res.cloudinary.com/colbydemo/image/fetch/f_auto,q_auto/${remoteUrl}`

  return {
    statusCode: 302,
    headers: event.headers,
    Location: cloudinaryUrl
  };
};

/**
 * isRemoteUrl
 */

function isRemoteUrl(url) {
  return url.startsWith('http');
}

module.exports.isRemoteUrl = isRemoteUrl;

/**
 * determineRemoteUrl
 */

function determineRemoteUrl(url, host) {
  if ( isRemoteUrl(url) ) return url;

  if ( !url.startsWith('/') ) {
    url = `/${url}`;
  }

  url = `${host}${url}`;

  return url;
}

module.exports.determineRemoteUrl = determineRemoteUrl;

/**
 * getQueryParams
 */

function getQueryParams(url) {
  if ( typeof url !== 'string') {
    throw new Error('Can not getQueryParams. Invalid URL');
  }

  const params = {};

  const urlSegments = url.split('?');

  urlSegments[1] && urlSegments[1].split('&').forEach(segment => {
    const [key, value] = segment.split('=');
    params[key] = value;
  });

  return params;
}

module.exports.getQueryParams = getQueryParams;