const fetch = require('node-fetch');
var express = require("express");
var app = express();
var cache= require('memory-cache');

app.get('/api/posts', (req, res) => {

    const { tags, sortBy, direction } = req.query; 

    fetchPosts(tags, sortBy, direction);

    function fetchPosts (tags, sortBy, direction){
        const tagsArray = tags.split(',');
    
        if (tags) {
            tags.indexOf(',') === -1 ?
            fetchSinglePost(tags, sortBy, direction):
            fetchMultiPost(tagsArray, sortBy, direction) 
        } else {
            res.status(400).send ({
                "error":"Tags parameter is required",
            });
        }
    };
    
    


})




app.listen(3000, () => {
 console.log("Server running on port 3000");
});