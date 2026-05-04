import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch your data here
        fetch('/api/threats/')
            .then(response => response.json())
            .then(data => setData(data));
    }, []);

    const filteredData = data.filter(item => {
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="home">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Field 1</th>
                        <th>Field 2</th>
                        <th>Field 3</th>
                        <th>Field 4</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.field1}</td>
                            <td>{item.field2}</td>
                            <td>{item.field3}</td>
                            <td>{item.field4}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;