exports.handler = async function (event, context) {
  console.log('event', event);
  console.log('context', context);

  const { rawUrl, headers } = event;

  const rawUrlSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = rawUrlSegments[0].replace(/\/$/, '');
  const pathSegments = rawUrlSegments[1].split('?');
  const imagePath = `/images${pathSegments[0]}`;

  const { deliveryType, uploadPreset } = getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;

  console.log('rawUrl', rawUrl)
  console.log('pathSegments', pathSegments)
  console.log('imagePath', imagePath)
  console.log('cloudName', cloudName)
  console.log('endpoint', endpoint)
  console.log('imagePath', imagePath)

  const remoteUrl = encodeURIComponent(`${endpoint}${imagePath}?fromCloudinary`);
  console.log('remoteUrl', remoteUrl)
  const cloudinaryUrl = `https://res.cloudinary.com/colbydemo/image/fetch/f_auto,q_auto/${remoteUrl}`

  console.log('cloudinaryUrl', cloudinaryUrl)

  return {
    statusCode: 302,
    headers: {
      Location: cloudinaryUrl,
      // 'Set-Cookie': 'colbycld=true'
    }
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