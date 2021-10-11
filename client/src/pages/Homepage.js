import React, { useState } from "react";
import axios from "axios";

const Homepage = props => {
    const [username, setUsername] = useState("");

    const onChange = ({ target: { value } }) => setUsername(value);

    const onClick = () => {
        axios.get('http://localhost:4000/api/getData/' + username, {
            header: { 'Content-Type': 'charset=UTF-8; application/json' },
            mode: "cors"
        })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
            })
    };

    return (
        <div>
            Time to start coding!
            <input value={username} onChange={onChange} />
            <button onClick={onClick}>Get instagram followers!</button>
        </div>
    );
};

export default Homepage;
