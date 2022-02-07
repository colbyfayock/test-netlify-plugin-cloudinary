exports.handler = async function(event, context) {

  const { rawUrl } = event;
  const pathSegments = rawUrl.split('.netlify/functions/cld_images');
  const baseUrl = pathSegments[0];
  const imagePath = `/images${pathSegments[1]}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      baseUrl,
      imagePath,
      event,
      context
    }),
  };
}