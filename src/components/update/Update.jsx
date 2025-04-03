import { useState, useContext } from "react";
import "./update.scss"
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';
const Update = ({ setOpenUpdate, user }) => {
    const [cover, setCover] = useState(null);
    const [profile, setProfile] = useState(null)
    const [text, setText] = useState({
        name: "",
        city: "",
        website: "",
    })

    const upload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file)
            const res = await makeRequest.post("/upload", formData);
            return res.data;
        } catch (err) {
            console.log(err);
        }
    }

    const handleChange = (e) => {
        setText((prev) => ({ ...prev, [e.target.name]: [e.target.value] }))
    }

    const { currentUser } = useContext(AuthContext)

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (user) => {
            const res = await makeRequest.put("/users", user);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["user"])
        },
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        let coverUrl;
        let profileUrl;

        coverUrl = cover ? await upload(cover) : user.coverPic;
        profileUrl = cover ? await upload(profile) : user.profilePic;

        mutation.mutate({ ...text, coverPic: coverUrl, profilePic: profileUrl })
        setOpenUpdate(false);
    }

    return (
        <div className="update-form">
            <h2>Update Profile</h2>
            <form>
                <label>Cover Photo</label>
                <input type="file" onChange={(e) => setCover(e.target.files[0])} />

                <label>Profile Picture</label>
                <input type="file" onChange={(e) => setProfile(e.target.files[0])} />

                <input type="text" name="name" onChange={handleChange} placeholder="Name" />
                <input type="text" name="city" onChange={handleChange} placeholder="City" />
                <input type="text" name="website" onChange={handleChange} placeholder="Website" />

                <button className="update-button" onClick={handleSubmit}>Update</button>
            </form>
            <button className="close-button" onClick={() => setOpenUpdate(false)}>Cancel</button>
        </div>


    )
}

export default Update;