import {getSong} from '../../lib/spotify';

const handler = async (req, res) => {
  const songId = req.body.data.songId
  const token = req.body.data.token
  const response = await getSong(songId, token);
  //console.log('Call get song', response)
  const items = response

  return res.status(200).json({items});
};

export default handler;