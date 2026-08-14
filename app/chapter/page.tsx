"use client";
import {useEffect,useState} from "react";
type Friend={id:number;name:string;nickname:string;note:string;memory:string;image?:string;color:string};
type Story={group:string;friends:Friend[]};
export default function Chapter(){
 const [friend,setFriend]=useState<Friend|null>(null),[group,setGroup]=useState("JOKES"),[ready,setReady]=useState(false);
 useEffect(()=>{const id=Number(new URLSearchParams(location.search).get("id"));try{const story=JSON.parse(localStorage.getItem("jokes-story")||"null") as Story|null;if(story){setGroup(story.group);setFriend(story.friends.find(item=>item.id===id)||null)}}finally{setReady(true)}},[]);
 if(!ready)return <main className="chapter-page"><p>Opening chapter…</p></main>;
 if(!friend)return <main className="chapter-page"><a href="/">← Back to story</a><h1>Chapter not found.</h1></main>;
 const marks=friend.name.split(" ").filter(Boolean).map(x=>x[0]).join("").toUpperCase();
 return <main className="chapter-page"><header><a className="brand" href="/"><b>J</b> {group}</a><a href="/">← Back to all friends</a></header><section><div className="chapter-portrait" style={{backgroundColor:friend.color}}>{friend.image?<img src={friend.image} alt={friend.name}/>:<span>{marks}</span>}</div><article><p>FRIENDSHIP CHAPTER</p><small>{friend.nickname}</small><h1>{friend.name}</h1><h2>{friend.note}</h2><blockquote>“{friend.memory}”</blockquote><a className="pill" href="/">Return to our story <i>↗</i></a></article></section></main>
}