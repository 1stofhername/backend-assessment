const fetch = require('node-fetch');
var express = require("express");
var app = express();
var cache= require('memory-cache');

app.get('/api/posts', (req, res) => {

    const { tags, sortBy, direction } = req.query; 

    fetchPosts(tags, sortBy, direction);


    // Fetch posts function calls fetchSinglePost for single tag and fetchMultiPost for multiple tags

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
    
    // Fetches single tag value from API, if sortBy value passes to sortByValidator, else returns results

    function fetchSinglePost (tag, sortBy, direction){
        const results={"posts":[]};
    
        fetch(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
            .then(res=>res.json())
            .then((data)=>{
                results.posts.push(...data.posts);
                sortBy?
                sortByValidator(results, sortBy, direction):
                res.status(200).send(results);
            })
    };

    // Fetches multiple tag values from API, passes to uniqueResults function
    
    function fetchMultiPost (tagsArray, sortBy, direction){
        let multResults = {"posts":[]}
        tagsArray.map((tag)=>{
            if (tagsArray.indexOf(tag)!==tagsArray.length-1) {
                fetch(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
                .then(res=>res.json())
                .then(data=>{multResults.posts.push(...data.posts)})
            } else if (tagsArray.indexOf(tag)===tagsArray.length-1) {
                fetch(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
                .then(res=>res.json())
                .then(data=>{multResults.posts.push(...data.posts);res.status(200).send(multResults);})
            }
        });
    };



})




app.listen(3000, () => {
 console.log("Server running on port 3000");
});