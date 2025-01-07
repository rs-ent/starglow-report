"use client";

import React, { useState, useRef } from "react";
import { useReport, useIntroduction, useValuation } from "../../context/GlobalData";
import Image from "next/image";
import { motion } from "framer-motion";
import { Textfit } from 'react-textfit';

const Introduction = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const reportData = useReport();
  const valuationData = useValuation();
  const data = useIntroduction();

  // 캐치프레이즈 & 서브 캐치프레이즈
  const catchPhrase = data?.catchPhrase || "엄청난 아티스트!";
  const subCatchPhrase = data?.subCatchPhrase || "와우~!";

  const springTransition = {
    type: "spring",
    stiffness: 280, // 높일수록 반발력(속도감) 강해짐
    damping: 20,    // 낮출수록 출렁거림이 커짐
    mass: 0.9,      // 질량. 작으면 가볍게 튐
  };

  // 소개글
  const introductionRaw = data?.introduction || "소개이다!";
  const paragraphMatches = introductionRaw.match(/<p>(.*?)<\/p>/gs) || [];
  const formattedIntroduction = paragraphMatches.map((block) =>
    block.replace(/^<p>/, "").replace(/<\/p>$/, "")
  );

  console.log('formattedIntroduction', formattedIntroduction);

  // underline 처리를 위한 HTML 전환
  const finalParagraphs = formattedIntroduction.map((paragraph, index) => {
    const html = paragraph
      .replace(
        /<strong>(.*?)<\/strong>/g,
        `<span class="font-bold relative inline-block">
          <span class="underline absolute left-0 bottom-0 w-full h-1 bg-yellow-300 scale-x-0"></span>
          $1
        </span>`
      )
      .replace(/<br\s*\/?>/g, '<div class="mb-2"></div>');

    return (
      <motion.div
        key={index}
        className={`relative inline-block text-sm font-light text-[var(--text-primary)] mb-2.5 ${
          html.trim() === "" ? "h-4 block" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
        // 뷰포트 진입 시 언더라인 등장
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
          },
        }}
      />
    );
  });

  // 멤버/앨범/회사
  const members = data?.members || [];
  const albums = data?.albums?.filter(a => a.isSelected === true) || valuationData.SV?.sub_data || valuationData.SV?.albums || [];
  const teamMembers = data?.teamMembers || [];

  // visibleData
  const visibleData =
    Object.entries(data?.additionalData || {})
      .filter(([key, value]) => value.visible)
      .sort(([, a], [, b]) => b.priority - a.priority)
      .map(([key, value]) => ({
        displayKey: value.displayKey || key,
        value: value.value,
      })) || [];

  return (
    <div>
      {/* 캐치프레이즈 섹션 */}
      <div className="text-center py-6">
        {/* 캐치프레이즈: 왼->오른쪽 + Blur */}
        <motion.h1
          className="whitespace-pre-wrap text-3xl text-gradient tracking-tight leading-tight inline-block"
          initial={{ 
            x: -200,                // 왼쪽 밖에서 시작
            filter: "blur(12px)",    // 블러로 흐릿하게
            opacity: 0.5,
          }}
          whileInView={{ 
            x: 0, 
            filter: "blur(0px)",
            opacity: 1,
          }}
          transition={springTransition}
          viewport={{ once: true, amount: 0.8 }}
        >
          {catchPhrase}
        </motion.h1>

        {/* 서브캐치프레이즈: 오른->왼쪽 + Blur */}
        <motion.p
          className="mt-3 text-base text-[var(--text-secondary)] italic"
          initial={{
            x: 200,                // 오른쪽 밖에서 시작
            filter: "blur(12px)",   // 블러
            opacity: 0.3,
          }}
          whileInView={{
            x: 0,
            filter: "blur(0px)",
            opacity: 1,
          }}
          transition={{
            ...springTransition,
            delay: 0.2, // 살짝 늦게 시작
          }}
          viewport={{ once: true, amount: 0.8 }}
        >
          {subCatchPhrase}
        </motion.p>
      </div>

      {/* Logo */}
      <motion.div
        className="my-16"
        // 처음에는 흐릿(blur) + 투명
        initial={{ 
          opacity: 0,
          filter: "blur(36px)",
        }}
        // 뷰포트에 들어왔을 때 서서히 선명하게 + 보여줌
        whileInView={{ 
          opacity: 1,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 2, // 천천히 페이드 (1.2초 예시)
          ease: "easeOut",
        }}
        viewport={{ once: true, amount: 0.8 }} // 한 번만 실행
      >
        <Image
          src={data?.logo || "/noimage.jpg"}
          alt="Artist Logo"
          width={150}
          height={150}
          className="mx-auto object-contain"
          unoptimized
        />
      </motion.div>

      {/* 간단한 소개글 */}
      <div className="py-6 px-4 text-[var(--text-third)] text-sm text-center grid grid-cols-1 gap-0.5">
        {finalParagraphs}
      </div>

      {isExpanded && (
        <>
          {/* 멤버 소개 */}
          {members.length > 0 && (
            <div>
              <h2 className="section-title">Members</h2>
              <div className="relative overflow-x-scroll">
                <div
                  className="flex gap-2 items-center h-full"
                  style={{
                    width: `calc(${members.length} * 200px)`,
                  }}
                >
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex-shrink-0 w-[200px] h-[250px] bg-[var(--background-muted)] rounded-md shadow-md relative"
                    >
                      <Image
                        src={member.profilePicture}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                        className="object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[var(--foreground)] to-transparent text-[var(--text-reverse)]">
                        <h3 className="text-sm font-bold">{member.name}</h3>
                        <p className="text-[0.6rem] font-light text-[var(--background-second)]">
                          {member.tags.join(" · ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 추가 내용 */}
          {visibleData.length > 0 && (
            <div className="compact-additional-data p-3">
              {visibleData.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-3 ${
                    index !== visibleData.length - 1
                      ? "border-b border-[var(--background-muted)]"
                      : ""
                  }`}
                >
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {item.displayKey}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] whitespace-pre-line text-right">
                    {typeof item.value === "object" && !Array.isArray(item.value)
                      ? Object.entries(item.value)
                          .map(([key, val]) => `${key}: ${val}`)
                          .join(", ")
                      : Array.isArray(item.value)
                      ? item.value.join(", ")
                      : item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 앨범 소개 */}
          {albums.length > 0 && (
            <div className="mt-12 mb-6">
              <h2 className="section-title">Discography</h2>
              <div className="relative overflow-x-scroll">
                <div
                  className="flex gap-2 items-center h-full"
                  style={{
                    width: `calc(${albums.length} * 200px)`,
                  }}
                >
                  {albums
                    .sort(
                      (a, b) =>
                        new Date(b.release_date) - new Date(a.release_date)
                    )
                    .map((album, index) => (
                      <div key={index} className="items-start justify-start h-[280px]">
                        <div className="flex w-[200px] h-[200px] bg-[var(--background-muted)] rounded-md shadow-md justify-start items-start relative">
                        <Image
                          src={album.img_url}
                          alt={`${album.album_title} Cover`}
                          fill
                          sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                          className="object-cover rounded-md"
                          loading="lazy"
                        />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold mt-2 mb-0.5">
                            {album.album_title}
                          </h3>
                          <p className="text-[10px] font-light">
                            {album.release_date}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* 기획사 맨파워 */}
          {teamMembers.length > 0 && (
            <div>
              <h2 className="section-title mt-14">Company</h2>
              <div className="grid grid-cols-1 gap-6">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="rounded-lg border overflow-hidden flex h-full relative"
                  >
                    {/* Team Member Details */}
                    <div className="absolute top-4 right-4">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={90}
                        height={0}
                        sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="px-4 pt-4 pb-1 flex flex-col justify-center text-left relative">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <h3 className="text-gradient text-lg">
                          {member.name}
                        </h3>
                        <p className="text-xs text-[var(--text-third)]">
                          {member.title}
                        </p>
                      </div>
                      <p className="mt-2 text-[11px] font-normal text-[var(--text-secondary)] whitespace-pre-line">
                        {member.experience}
                      </p>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {member.introduction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 더보기 버튼 */}
      <button
        className="expand-button mt-4"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? "Collapse" : "Expand"}
      </button>
    </div>
  );
};

export default Introduction;