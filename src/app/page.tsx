"use client";
import anime from "animejs/lib/anime.es";
import "./app.css";
import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import Image from "next/image";
interface Poet {
  title: string;
  author: string;
  content: string;
  description: {
    cmfConcept: string;
    colorcmf: string;
    materialcmf: string;
    functioncmf: string;
  };
}
function addNewlineAfterChinesePeriod(input: string): string {
  return input.replace(/。/g, "。<br>");
}

export default function Home() {
  const [curInput, setCurInput] = useState("");
  const [inputPlaceholder, setInputPlaceholder] = useState("Type here...");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [curPoet, setCurPoet] = useState<Poet | null>(null);
  const titledTypeRef = useRef<HTMLDivElement | null>(null);
  const auhtorTypeRef = useRef<HTMLDivElement | null>(null);
  const contentTypeRef = useRef<HTMLDivElement | null>(null);
  const descriptionTypeRef = useRef<HTMLDivElement | null>(null);
  const [curImg, setCurImg] = useState<string | null>(null);
  const [isStartImgLoading, setIsStartImgLoading] = useState(false);
  const handleInput = async () => {
    anime.remove(".card");
    anime.set(".card", {
      width: "100px",
      height: "100px",
      borderRadius: "100%",
    });
    if (
      titledTypeRef.current &&
      auhtorTypeRef.current &&
      contentTypeRef.current &&
      descriptionTypeRef.current
    ) {
      titledTypeRef.current.innerHTML = "";
      auhtorTypeRef.current.innerHTML = "";
      contentTypeRef.current.innerHTML = "";
      descriptionTypeRef.current.innerHTML = "";
    }
    anime({
      targets: ".card",
      scale: [1, 1.2],
      duration: 600,
      loop: true,
      easing: "easeInOutSine",
      direction: "alternate",
    });
    const text = curInput;
    setInputDisabled(true);
    setCurImg(null);
    setInputPlaceholder("Processing...");
    setCurInput("");
    const similarResponse = await fetch("/api/getSimilar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        str: text,
      }),
    });
    if (!similarResponse.ok) {
      anime.remove(".card");
      setInputDisabled(false);
      setInputPlaceholder("Failed! Type here again...");
      return;
    }
    setIsStartImgLoading(true);
    const { data: similar } = await similarResponse.json();
    if (similar.result.length === 0) {
      anime.remove(".card");
      setInputDisabled(false);
      setInputPlaceholder("No similar poem found! Type here again...");
      return;
    }
    const poet = {
      title: similar.result[0].title,
      author: similar.result[0].author,
      content: similar.result[0].content,
      description: JSON.parse(similar.result[0].description),
    };

    anime.remove(".card");
    anime({
      targets: ".card",
      width: "400px",
      height: "500px",
      borderRadius: "1rem",
    });
    setCurPoet(poet);
    new Typed(titledTypeRef.current, {
      strings: [poet.title],
      typeSpeed: 100,
      showCursor: false,
    });
    new Typed(auhtorTypeRef.current, {
      strings: [poet.author],
      typeSpeed: 100,
      showCursor: false,
    });

    new Typed(contentTypeRef.current, {
      strings: [addNewlineAfterChinesePeriod(poet.content)],
      typeSpeed: 100,
      showCursor: false,
    });
    new Typed(descriptionTypeRef.current, {
      strings: [poet.description.cmfConcept],
      typeSpeed: 100,
      showCursor: false,
    });

    console.log(JSON.stringify(similar.result[0].description));
    const imgResponse = await fetch("/api/getImg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: similar.result[0].title,
        description: JSON.stringify(similar.result[0].description),
        id: similar.result[0].id,
      }),
    });
    const img = await imgResponse.json();
    setCurImg(img.base64);
    setIsStartImgLoading(false);
    setInputDisabled(false);
    setInputPlaceholder("Type here...");
  };

  return (
    <main className="w-full h-[100vh]  overflow-hidden flex flex-col bg-[#e8e8e8] font-serif">
      <div className="cardContainer flex-col w-full h-full flex justify-center items-center ">
        <div className="card w-24 h-24 flex flex-col  overflow-hidden ">
          <div
            className="img w-full h-full  flex justify-center items-center flex-col "
            style={{
              backgroundImage: curImg ? `url(${curImg})` : "",
              backgroundSize: "cover",
              transition: "backgroundImage 0.5s",
              animation: isStartImgLoading ? "flash 2s infinite" : "",
            }}
          >
            <div
              style={{
                color: curImg ? "white" : "black",
              }}
            >
              <p
                className="title select-none w-full text-center font-bold text-xl "
                ref={titledTypeRef}
              ></p>

              <p
                className="author select-none w-full text-center   text-xs my-2  "
                ref={auhtorTypeRef}
              ></p>

              <p
                className="content select-none w-full text-center  "
                ref={contentTypeRef}
              ></p>
            </div>
          </div>
          <p
            className="why select-none w-full px-10 text-[0.8rem] my-8"
            ref={descriptionTypeRef}
          ></p>
        </div>
      </div>
      <div className="textbox  h-32 w-full flex flex-row p-10 px-20 mb-10">
        <input
          type="text"
          name="text"
          className="input h-full  w-full font-serif"
          placeholder={inputPlaceholder}
          disabled={inputDisabled}
          onChange={(e) => setCurInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleInput();
              console.log("Enter key pressed");
            }
          }}
          value={curInput}
        />
      </div>
    </main>
  );
}
