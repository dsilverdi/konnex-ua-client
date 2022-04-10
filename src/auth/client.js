const fetch = require('node-fetch');

const GetUserInfo = async (token) => {
    try{
        const response = await fetch(`https://dev-13j-hldy.us.auth0.com/userinfo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`   
            },
        });
        const data = await response.json();
        return data
    }catch (err) {
        console.error(err)
    }
}


module.exports = {
    GetUserInfo
}