import axios from "axios";
export const uploadImage =async (img) => {
    try {

        let imgUrl = null;
        const { data: { uploadURL } } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
        
        await axios({
            method: 'PUT',
            url: uploadURL,
            headers: {
                "Content-Type": img.type,
            },
            data: img,
        })
           
        imgUrl = uploadURL.split("?")[0]
        return imgUrl
    }
    catch (err) {
        console.log(err.message)
    }

}