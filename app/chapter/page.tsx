"use client";
import {useEffect,useState} from "react";
type Friend={id:number;name:string;nickname:string;note:string;memory:string;image?:string;specialImage?:string;color:string};
type Story={group:string;friends:Friend[]};
const colors=["#f0a76d","#7589ad","#d17979","#79a58e","#9c78b1"];
const fallback:Story={group:"JOKES",friends:["The spark","The calm","The storyteller","The compass","The wildcard"].map((nickname,i)=>({id:i+1,name:`Friend ${i+1}`,nickname,note:"Add a short line about this friend.",memory:"Write a favorite memory, funny moment or inside joke here.",color:colors[i]}))};
export default function Chapter(){
 const [friend,setFriend]=useState<Friend|null>(null),[group,setGroup]=useState("JOKES"),[ready,setReady]=useState(false);
 useEffect(()=>{const id=Number(new URLSearchParams(location.search).get("id"));let story=fallback;try{const stored=localStorage.getItem("jokes-story");if(stored)story=JSON.parse(stored) as Story}catch{}setGroup(story.group);setFriend(story.friends.find(item=>item.id===id)??fallback.friends.find(item=>item.id===id)??fallback.friends[0]);setReady(true)},[]);
 if(!ready)return <main className="folder-page loading-folder"><span>Opening a special chapter…</span></main>;
 if(!friend)return null;
 const marks=friend.name.split(" ").filter(Boolean).map(x=>x[0]).join("").toUpperCase();
 return <main className="folder-page">
  <div className="folder-glow glow-one"/><div className="folder-glow glow-two"/>
  <header><a className="brand" href="/"><b>J</b> {group}</a><a className="back-story" href="/"><span>←</span> Back to all friends</a></header>
  <section className="chapter-intro"><p><span/> FRIENDSHIP CHAPTER {String(friend.id).padStart(2,"0")}</p><h1>A little corner<br/>made for <em>{friend.name}.</em></h1><div><small>{friend.nickname}</small><span>Scroll to open the memory folder ↓</span></div></section>
  <section className="memory-stage" aria-label={`Memory folder for ${friend.name}`}>
   <div className="folder-back"><span className="folder-tab">{friend.name}</span></div>
   <article className="paper thought-paper">
    <div className="paper-pin">♥</div><p>WHAT I WANT YOU TO KNOW</p><h2>Dear {friend.name},</h2><h3>{friend.note}</h3><blockquote>“{friend.memory}”</blockquote><footer><span>Written with love</span><b>{group}</b></footer>
   </article>
   <article className="paper photo-paper">
    <div className="tape"/><div className="special-photo" style={{backgroundColor:friend.color}}>{friend.specialImage?<img src={friend.specialImage} alt={`A special memory with ${friend.name}`}/>:friend.image?<img src={friend.image} alt={friend.name}/>:<span>{marks}</span>}</div><div className="photo-caption"><p>A frame worth keeping forever.</p><small>{friend.specialImage?"OUR SPECIAL MEMORY":"Add a special image in Edit story"}</small></div>
   </article>
   <div className="folder-front"><span>{String(friend.id).padStart(2,"0")}</span><div><small>THE {group} ARCHIVE</small><strong>{friend.name}</strong></div><i>♥</i></div>
  </section>
  <section className="chapter-closing"><p>Some people make ordinary days unforgettable.</p><a className="pill" href="/"><span>Explore another chapter</span><i>→</i></a></section>
 </main>
}