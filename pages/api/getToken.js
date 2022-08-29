import {getToken} from '../../lib/spotify';

const handler = async (req, res) => {
  const response = await getToken();
  //console.log('Call get token', response)
  const items = response.access_token

  return res.status(200).json({items});
};

export default handler;