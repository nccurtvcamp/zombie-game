"use client";

import { useState } from "react";
import ZombieGame from "../components/ZombieGame";
import StartImg from "@/photo/start.svg";
import zombieImg from "@/photo/zombie.svg";
import BackgroundImg from "@/photo/background3.png";
import ResultImg from "@/photo/result.svg";
import TitleImg from "@/photo/title.svg";
import ReplayImg from "@/photo/replay.svg";
import BackImg from "@/photo/back.svg";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
  };

  const handleGameOver = () => {
    setGameStarted(false);
    setGameOver(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-8">
      {/* 背景图片 */}
      <div className="fixed inset-0 w-full h-full">
        <img
          src={BackgroundImg.src}
          alt="background"
          className="w-full h-full object-cover blur-md"
        />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen">
        {!gameStarted && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] z-50">
            <img
              src={TitleImg.src}
              alt="殭屍別吵我睡覺"
              className="w-full h-full"
            />
          </div>
        )}
        
        {!gameStarted ? (
          <div className="text-center mt-[200px]">
            {gameOver ? (
              <div className="flex flex-col items-center">
                <div className="relative w-[300px] h-[300px] z-10">
                  <img
                    src={ResultImg.src}
                    alt="遊戲結束"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold mb-4">遊戲結束！</h2>
                    <p className="text-2xl mb-6">最終得分： {score}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={startGame}
                    className="relative w-20 h-20 transition-transform hover:scale-105"
                  >
                    <img
                      src={ReplayImg.src}
                      alt="再玩一次"
                      className="w-full h-full object-contain"
                    />
                  </button>
                  <a href="https://classroomdaydream.vercel.app">
                    <button
                      className="relative w-20 h-20 transition-transform hover:scale-105"
                    >
                      <img
                        src={BackImg.src}
                        alt="返回"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={startGame}
                className="relative w-48 h-48 transition-transform hover:scale-105 -mt-[200px]"
              >
                <img
                  src={StartImg.src}
                  alt="開始遊戲"
                  className="w-full h-full object-contain"
                />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <div className="flex justify-between mb-4">
              <div className="text-2xl">分數: {score}</div>
            </div>
            
            <ZombieGame 
              onScoreChange={setScore}
              onGameOver={handleGameOver}
            />
            
            <div className="mt-4 text-center">
              <p className="text-lg">點擊工具打擊殭屍！！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
