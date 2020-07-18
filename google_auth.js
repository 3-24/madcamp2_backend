module.exports = async function(body){
	const {idToken} = body;
	const {auth} = require('google-auth-library');
	const client = auth.fromAPIKey('AIzaSyAWywGxHc-GZ8-DhduNcOnMj4cTEktwStU');
	const res = await client.verifyIdToken({idToken});
	const {email, name, picture, sub: googleid} = res.getPayload();
	return email;
}
