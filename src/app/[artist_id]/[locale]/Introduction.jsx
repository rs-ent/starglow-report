"use client";

import React, { useState } from "react";
import { useIntroduction, useValuation } from "../../../context/GlobalData";
import Image from "next/image";
import { motion } from "framer-motion";
import { safeLangValue } from "../../../script/convertLang";
import IntroductionGallery from "./Introduction.Gallery";

const Introduction = ({locale}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const valuationData = useValuation();
  const data = useIntroduction();

  // 캐치프레이즈 & 서브 캐치프레이즈
  const catchPhrase = safeLangValue(data?.catchPhrase, locale);
  const subCatchPhrase = safeLangValue(data?.subCatchPhrase, locale);
  
  // 갤러리
  const galleryImages = data?.galleryImages || [];

  // 소개글
  const introduction = safeLangValue(data?.introduction, locale);
  const paragraphMatches = introduction.match(/<p[^>]*>(.*?)<\/p>/gs) || [];
  const formattedIntroduction = paragraphMatches.map((block) =>
    block
      .replace(/^<p[^>]*>/, "")
      .replace(/<\/p>$/, "")
  );

  const finalParagraphs = formattedIntroduction.map((paragraph, index) => {
    // <strong>...</strong>을 <span>으로 치환
    // <br/>, <br>을 <div class="mb-2"></div>로 치환
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
        // 문단별 styling
        className={`relative inline-block text-sm font-light text-[var(--text-primary)] mb-2.5 ${
          html.trim() === "" ? "h-4 block" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
        // 뷰포트 애니메이션
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.7 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
          },
        }}
      />
    );
  });

  // 멤버/앨범/회사
  const members = data?.members || [];
  const albums =
    data?.albums?.filter((a) => a.isSelected === true) ||
    valuationData.SV?.sub_data ||
    valuationData.SV?.albums ||
    [];
  const teamMembers = data?.teamMembers || [];

  // visibleData
  const visibleData =
    Object.entries(data?.additionalData || {})
      .filter(([, value]) => value.visible)
      .sort(([, a], [, b]) => b.priority - a.priority)
      .map(([k, v]) => ({
        displayKey: safeLangValue(v.displayKey, locale) || k,
        value: v.value,
      })) || [];

  return (
    <div>
      {/* 캐치프레이즈 섹션 */}
      <div className="text-center py-6">
        {/* 캐치프레이즈: 왼->오른쪽 + Blur */}
        <motion.h1
          className="whitespace-pre-wrap text-3xl text-gradient tracking-tight leading-tight inline-block text-glow"
          initial={{ filter: "blur(12px)", opacity: 0.2 }}
          whileInView={{ filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.6 }}
        >
          {catchPhrase}
        </motion.h1>

        {/* 서브캐치프레이즈 */}
        <motion.p
          className="mt-3 text-base text-[var(--text-secondary)] italic"
          initial={{ filter: "blur(12px)", opacity: 0.2 }}
          whileInView={{ filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          {subCatchPhrase}
        </motion.p>
      </div>

      {/* Logo */}
      <motion.div
        className="my-16"
        initial={{ opacity: 0, filter: "blur(36px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.8 }}
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

      {/* 갤러리 */}
      {galleryImages.length > 0 && (
        <IntroductionGallery galleryImages={galleryImages} />
      )}

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
                  {members.map((member) => {
                    // member.name, member.tags가 { ko, en } 구조일 수도 있음
                    const memberName = safeLangValue(member.name, locale);
                    // tags가 배열이라면 각각을 safeLangValue 처리 (단, tags가 문자열 배열 vs 다국어 배열인지 확인 필요)
                    const tagsArray = member.tags || [];
                    const tagsText = tagsArray
                      .map((tag) => {
                        if (typeof tag === 'object') {
                          return safeLangValue(tag, locale);
                        }
                        return tag; // 단순 문자열이면 그대로
                      })
                      .join(" · ");

                    return (
                      <div
                        key={member.id}
                        className="flex-shrink-0 w-[200px] h-[250px] bg-[var(--background-muted)] rounded-md shadow-md relative"
                      >
                        <Image
                          src={member.profilePicture}
                          alt={memberName}
                          fill
                          sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                          className="object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 w-full px-4 pb-3 bg-gradient-to-t from-black to-transparent bg-opacity-65">
                          <h3 className="text-sm font-bold text-glow text-gradient mt-20">
                            {memberName}
                          </h3>
                          <p className="text-[0.6rem] font-light text-[var(--text-secondary)] mt-1">
                            {tagsText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 추가 내용 */}
          {visibleData.length > 0 && (
            <div className="compact-additional-data p-3">
              {visibleData.map((item, index) => {
                // item.value가 { ko, en } or array/object
                // 만약 단순하게 ko/en 문자열이라면 safeLangValue(item.value, locale)
                // 그 외 객체/배열이면 기존 로직 유지
                let displayValue = item.value;
                if (
                  displayValue &&
                  typeof displayValue === "object" &&
                  !Array.isArray(displayValue)
                ) {
                  // 가능성이 1) 다국어 객체 or 2) 일반 객체
                  const maybeLang = safeLangValue(displayValue, locale);
                  // 만약 다국어 구조였다면 maybeLang != ''
                  if (maybeLang) {
                    displayValue = maybeLang;
                  } else {
                    // 일반 객체면 키:값 형태로
                    displayValue = Object.entries(displayValue)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ");
                  }
                } else if (Array.isArray(displayValue)) {
                  displayValue = displayValue.join(", ");
                }

                return (
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
                      {displayValue}
                    </span>
                  </div>
                );
              })}
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
                    .map((album, idx) => {
                      // album_title이 { ko, en }일 수 있음
                      const albumTitle = safeLangValue(album.album_title, locale);

                      return (
                        <div
                          key={idx}
                          className="items-start justify-start h-[280px]"
                        >
                          <div className="flex w-[200px] h-[200px] bg-[var(--background-muted)] rounded-md shadow-md justify-start items-start relative">
                            <Image
                              src={album.img_url}
                              alt={`${albumTitle} Cover`}
                              fill
                              sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                              className="object-cover rounded-md"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold mt-2 mb-0.5">
                              {albumTitle}
                            </h3>
                            <p className="text-[10px] font-light">
                              {album.release_date}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* 기획사 맨파워 */}
          {teamMembers.length > 0 && (
            <div>
              <h2 className="section-title mt-14">Company</h2>
              <div className="grid grid-cols-1 gap-6">
                {teamMembers.map((member, index) => {
                  const name = safeLangValue(member.name, locale);
                  const title = safeLangValue(member.title, locale);
                  const experience = safeLangValue(member.experience, locale);
                  const introduction = safeLangValue(member.introduction, locale);

                  return (
                    <div
                      key={index}
                      className="rounded-lg border overflow-hidden flex h-full relative"
                    >
                      <div className="absolute top-4 right-4">
                        <Image
                          src={member.image}
                          alt={name}
                          width={90}
                          height={0}
                          sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="px-4 pt-4 pb-1 flex flex-col justify-center text-left relative">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <h3 className="text-gradient text-lg">{name}</h3>
                          <p className="text-xs text-[var(--text-third)]">
                            {title}
                          </p>
                        </div>
                        <p className="mt-2 text-[11px] font-normal text-[var(--text-secondary)] whitespace-pre-line">
                          {experience}
                        </p>
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                          {introduction}
                        </p>
                      </div>
                    </div>
                  );
                })}
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