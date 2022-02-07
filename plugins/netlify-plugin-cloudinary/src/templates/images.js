const functionName = 'cld_images';

exports.handler = async function(event, context) {

  const { path } = event;
  const imagePath = `/images${path.split(functionName)[1]}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      imagePath,
      event,
      context
    }),
  };
}