const fetch = require('node-fetch');
var express = require("express");
var app = express();
var cache= require('memory-cache');

app.get('/api/posts', (req, res) => {

    const { tags, sortBy, direction } = req.query; 

    fetchPosts(tags, sortBy, direction);


    // Fetch posts function calls fetchSinglePost or fetchMultiPost based on index of (,)

    function fetchPosts (tags, sortBy, direction){
        const tagsArray = tags.split(',');
    
        if (tags) {
            tags.indexOf(',') === -1 ?
            fetchSinglePost(tags, sortBy, direction) :
            fetchMultiPost(tagsArray, sortBy, direction);
        } else {
            res.status(400).send ({
                "error":"Tags parameter is required",
            });
        }
    };
    
    // Checks for cache results fetches single tag value from API, if sortBy value passes to sortByValidator, else returns results

    function fetchSinglePost (tag, sortBy, direction){
        const results = cache.get(`${tag}`)

        // check if cache exists for tag then check for sortBy value

        if (results) {
            sortBy ?
            
            sortByValidator(cache.get(`${tag}`)) :
            
            res.status(200).send({
                "posts": results
            });
            

            // else fetch and cache data for tag

        } else {
            fetch(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
                .then(res=>res.json())
                .then((data)=>{
                    cache.put(`${tag}`, data.posts, 10000);
                    if (sortBy) {
                        sortByValidator(cache.get(`${tag}`))
                    } else {
                        res.status(200).send({
                            "posts": cache.get(`${tag}`)
                        });
                        
                    }
                }
            )}
    };

    // Fetches multiple tag values from API, passes to getUniqueResults function
    
    function fetchMultiPost (tagsArray){
        let multResults = {"posts":[]};

        tagsArray.map((tag)=>{
            const results = cache.get(`${tag}`);

            if (tagsArray.indexOf(tag) !== tagsArray.length - 1) {

                if(results){

                    multResults.posts.push(...results, ...multResults.posts);

                } else {

                    fetch(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
                    .then(res=>res.json())
                    .then(data=>{

                        cache.put(`${tag}`, data.posts, 10000);
                        multResults.posts.push(...data.posts, ...multResults.posts);
                    })
                }

            } else if (tagsArray.indexOf(tag) === tagsArray.length-1) {

                if(results){
                    multResults.posts.push(...results, ...multResults);
                    
                } else {
                fetch(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
                .then(res=>res.json())
                .then(data=>{
                    cache.put(`${tag}`, data.posts, 10000);
                    multResults.posts.push(...data.posts);
                    
                    // getUniqueResults(multResults);
                    })
                }
            }
        });
        res.status(200).send(multResults)
    };

    // Remove duplicate query results and send to client or if sortBy value present pass on to sort validation function

    function getUniqueResults (results, sortBy, direction) {
        const uniquePosts={"posts":[]}
        uniquePosts.posts.push(...new Map(results.posts.map((item) => [item["id"], item])).values());
        if (sortBy) {
        sortByValidator(sortBy, uniquePosts, direction)
        } else {
        res.send(uniquePosts)
        }
    };

    // Validate sortBy value and if valid pass to sortQueryResults function else return error message

    function sortByValidator (results){
        const validSortByValue = ['id','reads','likes','popularity'];
        
        if(validSortByValue.indexOf(sortBy) !== -1) 

            {
                sortQueryResults(results)
            } else { 

            res.status(400).send({
                "error": `sortBy parameter is invalid ${sortBy}`,
                })
            }
        };

   // Sort results by sortBy value and according to direction

    function sortQueryResults (results) {
        let sortedPosts;

        if(!direction || direction.toUpperCase() === "asc".toUpperCase()) {
            sortedPosts = results.sort((a, b) => {
                return a[sortBy] - b[sortBy];
            });
        } else if (direction.toUpperCase() === "desc".toUpperCase()) {
            sortedPosts = results.sort((a, b) => {
                return b[sortBy] - a[sortBy];
            });
        } else if (direction !== "asc".toUpperCase() || "desc".toUpperCase() || undefined)
        {
            res.status(400).send({
                "error": "direction parameter is invalid",
            });
        }
        res.send(sortedPosts);
    }   


})




app.listen(3000, () => {
 console.log("Server running on port 3000");
});