import React from "react";
import axios from "axios";
import { SAPIBase } from "../tools/api";
import Header from "../components/header";
import "./css/feed.css";

interface IAPIResponse  { _id: string, title: string, content: string }

const FeedPage = (props: {}) => {
  const [ LAPIResponse, setLAPIResponse ] = React.useState<IAPIResponse[]>([]);
  const [ EditId, setEditId ] = React.useState<string>("default");
  const [ EditPostTitle, setEditPostTitle ] = React.useState<string>("");
  const [ EditPostContent, setEditPostContent ] = React.useState<string>("");
  const [ NPostCount, setNPostCount ] = React.useState<number>(0);
  const [ SNewPostTitle, setSNewPostTitle ] = React.useState<string>("");
  const [ SNewPostContent, setSNewPostContent ] = React.useState<string>("");

  React.useEffect( () => {
    let BComponentExited = false;
    const asyncFun = async () => {
      const { data } = await axios.get<IAPIResponse[]>( SAPIBase + `/feed/getFeed?count=${ NPostCount }`);
      if (BComponentExited) return;
      setLAPIResponse(data);
    };
    asyncFun().catch((e) => window.alert(`Error while running API Call: ${e}`));
    return () => { BComponentExited = true; }
  }, [ NPostCount ]);

  const EditClick=(id: string)=>{
    const asyncFun = async () => {
      const {data} = await axios.post<IAPIResponse>( SAPIBase + '/feed/editFeed', { id: id} );
      const value = Object.values(data)[0];
      console.log(value._id);
      setEditId(value._id);
      setEditPostTitle(value.title);
      setEditPostContent(value.content);
    };
    asyncFun().catch((e) => window.alert(`Error while running API Call: ${e}`));
  }

  const createNewPost = () => {
    const asyncFun = async () => {
      await axios.post( SAPIBase + '/feed/addFeed', { title: SNewPostTitle, content: SNewPostContent } );
      setNPostCount(NPostCount + 1);
      setSNewPostTitle("");
      setSNewPostContent("");
    }
    asyncFun().catch(e => window.alert(`AN ERROR OCCURED! ${e}`));
  }

  const deletePost = (id: string) => {
    const asyncFun = async () => {
      // One can set X-HTTP-Method header to DELETE to specify deletion as well
      await axios.post( SAPIBase + '/feed/deleteFeed', { id: id } );
      setNPostCount(Math.max(NPostCount - 1, 0));
    }
    asyncFun().catch(e => window.alert(`AN ERROR OCCURED! ${e}`));
  }

  const editPost = (id:string) => {
    const asyncFun = async ()=> {
      await axios.post( SAPIBase + '/feed/editFeedSave', { id: id, title: EditPostTitle, content: EditPostContent } );
      setEditId("default");
      setEditPostTitle("");
      setEditPostContent("");
    }
    asyncFun().then(()=>{
      let BComponentExited = false;
      const asyncFun = async () => {
        const { data } = await axios.get<IAPIResponse[]>( SAPIBase + `/feed/getFeed?count=${ NPostCount }`);
        console.log(data);
        if (BComponentExited) return;
        setLAPIResponse(data);
      };
      asyncFun().catch((e) => window.alert(`Error while running API Call: ${e}`));
      return () => { BComponentExited = true; }
    }).catch(e => window.alert(`AN ERROR OCCURED! ${e}`));
  }

  return (
    <div className="Feed">
      <Header/>
      <h2>Feed</h2>
      <div className={"feed-length-input"}>
        Number of posts to show: &nbsp;&nbsp;
        <input type={"number"} value={ NPostCount } id={"post-count-input"} min={0}
               onChange={ (e) => setNPostCount( parseInt(e.target.value) ) }
        />
      </div>
      <div className={"feed-list"}>
        { LAPIResponse.map( (val, i) =>
          val._id===EditId?
          (<div key={i} className={"feed-item-add"}>
            Title: <input type={"text"} value={EditPostTitle} onChange={(e) => setEditPostTitle(e.target.value)}/>
            &nbsp;&nbsp;&nbsp;&nbsp;
            Content: <input type={"text"} value={EditPostContent} onChange={(e) => setEditPostContent(e.target.value)}/>
            <div className={"post-add-button"} onClick={(e) => editPost(`${val._id}`)}>Save Post!</div>
          </div>)
          :(<div key={i} className={"feed-item"}>
            <div className={"delete-item"} onClick={(e) => deletePost(`${val._id}`)}>ⓧ</div>
            <div className={"edit-item"} onClick={(e) => EditClick(`${val._id}`)}>ⓧ</div>
            <h3 className={"feed-title"}>{ val.title }</h3>
            <p className={"feed-body"}>{ val.content }</p>
          </div>)
        ) }
        <div className={"feed-item-add"}>
          Title: <input type={"text"} value={SNewPostTitle} onChange={(e) => setSNewPostTitle(e.target.value)}/>
          &nbsp;&nbsp;&nbsp;&nbsp;
          Content: <input type={"text"} value={SNewPostContent} onChange={(e) => setSNewPostContent(e.target.value)}/>
          <div className={"post-add-button"} onClick={(e) => createNewPost()}>Add Post!</div>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;