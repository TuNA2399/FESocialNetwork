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
        let coverUrl = user.coverPic;
        let profileUrl = user.profilePic;

        coverUrl = cover && await upload(cover);
        profileUrl = cover && await upload(profile);

        mutation.mutate({...text, coverPic: coverUrl, profilePic: profileUrl})
        setOpenUpdate(false);
    }

    return (
        <div className="update">Update
            <form>
                <input type="file" />
                <input type="file" />
                <input type="text" name="name" onChange={handleChange} />
                <input type="text" name="city" onChange={handleChange} />
                <input type="text" name="website" onChange={handleChange} />
                <button onClick={handleSubmit}>Update</button>
            </form>
            <button onClick={() => setOpenUpdate(false)}>X</button>
        </div>
    )
}

export default Update;