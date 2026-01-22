import { useParams } from "react-router-dom"
import InPageNavigation from "../components/inPageNavigation";
import { useEffect, useState } from "react";
import Loader from "../components/loader";
import AnimationWrapper from "../common/animation";
import BlogPostCard from "../components/blogPost";
import NoDataMessage from "../components/noData";
import LoadMoreDataBtn from "../components/loadMoreData";
import { API } from "../common/api";
import { filterPaginationData } from "../common/filterPaginationData";
import axios from "axios";
import UserCard from "../components/userCard";

const SearchPage = () => {

    let { query } = useParams();
    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null);
    let [pageState, setPageState] = useState("home");
        
    const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
        try {
            let {data} = await axios.post(`${API}/search-blogs`, { query, page })
       
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr
            })
        
            setBlogs(formatedData);
        
        }
        catch (err) {
            console.log(err);
        }
    }

    const fetchUsers = async() => {
        let {data: {users}} = await axios.post(`${API}/search-users`, { query });
        console.log(users);
        
        if (users) {
            setUsers(users)
        }
    }

    const resetState = () => {
        
        setBlogs(null);
        setUsers(null);
    }

    useEffect(() => {

        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers();
        
    }, [query])
    
    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ?
                            users.map((user, i) => {
                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }} >
                                    <UserCard user={user}/>
                                </AnimationWrapper>
                            })
                            : <NoDataMessage message="No user found" />
                }            
            </>
        )
    }
    return (
        <>
            <section className="h-cover flex justify-center gap-10">
                <div className="w-full">
                    <InPageNavigation routes={[`Search Results from ${query}`, " Accounts Matched"]} defaultHidden={["Accounts matched"]}>
                        
                        <>
                            {
                                blogs == null ? <Loader />
                                    : (

                                        blogs.results.length?
                                        blogs.results.map((blog, i) => {
                                        return <AnimationWrapper
                                            key={i}
                                            transition={
                                                {
                                                    duration: 1,
                                                    delay: i * .1
                                                }}
                                        >
                                        <BlogPostCard categoryTag={ pageState } content={ blog } author={ blog.author.personal_info} />
                                        </AnimationWrapper>
                                        })
                                            :<NoDataMessage message="No blogs published"/>
                                    )
                            } 
                        <LoadMoreDataBtn state={ blogs } fetchDataFunc={ searchBlogs }/>
                            
                        </>

                        <UserCardWrapper/>
                        
                    </InPageNavigation>

                </div>

                <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-gray-200 pl-8 pt-3 max-md:hidden">
                    <h1 className="font-medium text-xl mb-8">User related to search
                        <i className="fi fi-rr-user pl-2 mt-1"></i>
                    </h1>
                    <UserCardWrapper/>

                </div>

            </section>
            
        </>
    )
}
export default SearchPage