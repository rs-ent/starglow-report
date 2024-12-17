'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useReport, useIntroduction, useValuation } from '../../context/GlobalData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { FaCompactDisc } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const Introduction = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const reportData = useReport();
    const valuationData = useValuation();
    const data = useIntroduction();
    
    const catchPhraseRef = useRef(null);
    const subCatchPhraseRef = useRef(null);
    const catchPhraseRaw = data?.catchPhrase || '엄청난 아티스트!';
    const formattedCatchPhrase = catchPhraseRaw.replace(/(.{14})/g, '$1\n');
    const subCatchPhrase = data?.subCatchPhrase || '와우~!';

    const logoRef = useRef(null);
    
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(null);
    const galleryRef = useRef(null);
    
    const introductionRaw = data?.introduction || '소개이다!';
    const paragraphMatches = introductionRaw.match(/<p>(.*?)<\/p>/gs) || [];
    const formattedIntroduction = paragraphMatches.map(block => {
        // <p>, </p> 제거
        return block.replace(/^<p>/, '').replace(/<\/p>$/, '');
      });

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
            <div
                key={index}
                ref={(el) => (textBlocksRef.current[index] = el)}
                className={`relative inline-block text-sm font-light text-[var(--text-primary)] mb-2.5 ${html.trim() === '' ? 'h-4 block' : ''}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    });
    const textBlocksRef = useRef([]);

    const membersRef = useRef(null);
    const members = data?.members || [];

    const albums = valuationData.SV?.sub_data || valuationData.SV?.albums || [];
    const teamMembers = data?.teamMembers || [];

    const visibleData = Object.entries(data?.additionalData || {})
    .filter(([key, value]) => value.visible) // visible이 true인 항목만 필터링
    .sort(([, a], [, b]) => b.priority - a.priority) // priority 기준으로 정렬
    .map(([key, value]) => ({
        displayKey: value.displayKey || key,
        value: value.value,
    })) || [];

    // 갤러리 이미지 클릭 핸들러
    const handleGalleryImageClick = (index) => {
        setActiveGalleryIndex(index);
    };
    
    useLayoutEffect(() => {
        const catchPhraseElement = catchPhraseRef.current;
        const subCatchPhraseElement = subCatchPhraseRef.current;

        // CatchPhrase Animation
        gsap.fromTo(
            catchPhraseElement,
            {
                opacity: 0,
                y: 50,
                scale: 0.93,
                rotation: -8,
                backgroundSize: '0% 40%',
            },
            {
                backgroundSize: '100% 40%',
                opacity: 1,
                y: 0,
                scale: 1.05,
                rotation: 0,
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: catchPhraseElement,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none none',
                },
            }
        );

        // SubCatchPhrase Animation
        gsap.fromTo(
            subCatchPhraseElement,
            {
                opacity: 0,
                y: 20,
                scale: 0.85,
                rotation: 4,
            },
            {
                opacity: 1,
                y: -10,
                scale: 0.95,
                duration: 1,
                delay: 0.3,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: subCatchPhraseElement,
                    start: 'top 85%',
                    end: 'bottom 15%',
                    toggleActions: 'play none none none',
                },
            }
        );

        const logoElement = logoRef.current;
        gsap.fromTo(
            logoElement,
            {
                opacity: 0,
                filter: 'blur(10px)', // 초기 블러 처리
                scale: 0.7, // 살짝 축소된 상태로 시작
            },
            {
                opacity: 1,
                filter: 'blur(0px)', // 블러 제거
                scale: 1, // 원래 크기로 복원
                duration: 2.5,
                ease: 'power2.inOut',
                scrollTrigger: {
                    trigger: logoElement,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none none',
                },
            }
        );

        const galleryElement = galleryRef.current;
        gsap.to(galleryElement, {
            overflowX: 'scroll',
        });

        const galleryItems = galleryRef.current.children;
        Array.from(galleryItems).forEach((item, index) => {
            const delay = Math.random() * 0.6; // 랜덤한 딜레이
            const direction = Math.random() > 0.5 ? 1 : -1; // 랜덤 방향
            const offsetY = direction * (Math.random() * 50 + 50); // 랜덤한 y-offset

            gsap.fromTo(
                item,
                {
                    opacity: 0,
                    y: offsetY, // 랜덤하게 아래 또는 위로 시작
                    filter: 'blur(5px)', // 초기 블러 처리
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)', // 블러 제거
                    duration: 2,
                    delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 90%',
                        end: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        });

        textBlocksRef.current.forEach((block, index) => {
            const underline = block.querySelector('.underline');
            if (underline) {
                gsap.fromTo(
                    underline,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 0.5,
                        delay: index * 0.2,
                        transformOrigin: 'left center',
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: block,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }
        });
    }, []);

    return (
        <div>
            <div className="text-center py-6">
                {/* CatchPhrase */}
                <h1
                    ref={catchPhraseRef}
                    className="text-4xl font-extrabold tracking-tight leading-tight relative inline-block"
                    style={{ color: reportData.main_color, whiteSpace: 'pre-line' }}
                >
                    <span
                        className="relative"
                        style={{
                            backgroundImage: 'linear-gradient(120deg, rgba(255, 223, 102, 0.5) 0%, rgba(255, 223, 102, 0.2) 100%)',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: '0 90%',
                            backgroundSize: '100% 40%',
                            padding: '0 2px',
                            borderRadius: '2px',
                        }}
                    >
                        {formattedCatchPhrase}
                    </span>
                </h1>

                {/* SubCatchPhrase */}
                <p
                    ref={subCatchPhraseRef}
                    className="mt-3 text-base text-[var(--text-secondary)] italic"
                >
                    {subCatchPhrase}
                </p>
            </div>

            {/* Logo */}
            <div className="my-10">
                <Image
                    ref={logoRef}
                    src={data?.logo || '/noimage.jpg'}
                    alt="Artist Logo"
                    width={150}
                    height={150}
                    className="mx-auto object-contain"
                    unoptimized // 이미지 최적화 해제   
                />
            </div>

            <div
                ref={galleryRef}
                className="flex gap-1 overflow-x-scroll px-4 py-6 overflow-y-visible scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {data?.galleryImages.map((image, index) => (
                    <div
                        key={index}
                        className={`relative flex-shrink-0 transition-all duration-300 ${
                            activeGalleryIndex === index ? 'w-[300px]' : 'w-[60px]'
                        } h-[200px]`}
                        onClick={() => handleGalleryImageClick(index)}
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        <Image
                            src={image.url}
                            alt={image.name}
                            fill
                            sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                            loading='lazy'
                            className={`object-cover rounded-md transition-all h-full w-full ${
                                activeGalleryIndex === index ? 'shadow-xl' : 'opacity-90'
                            }`}
                        />
                    </div>
                ))}
            </div>

            {/* 간단한 소개글 */}
            <div className="py-6 px-4 text-center grid grid-cols-1 gap-0.5">
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
                                ref={membersRef}
                                className="flex gap-2 items-center h-full"
                                style={{
                                    width: `calc(${members.length} * 200px)`, // 카드 너비 280px 기반으로 계산
                                }}
                            >
                                {members.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className="flex-shrink-0 w-[200px] h-[250px] bg-[var(--background-muted)] rounded-md shadow-md relative"
                                    >
                                        {/* 프로필 사진 */}
                                        <Image
                                            src={member.profilePicture}
                                            alt={member.name}
                                            fill
                                            sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                                            className="object-cover"
                                            loading='lazy'
                                        />
                                        {/* 멤버 정보 */}
                                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[var(--foreground)] to-transparent text-[var(--text-reverse)]">
                                            <h3 className="text-base font-bold">{member.name}</h3>
                                            <p className="text-xs font-light">
                                                {member.tags.join(' · ')}
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
                                    index !== visibleData.length - 1 ? 'border-b border-[var(--background-muted)]' : ''
                                }`}
                            >
                                <span className="text-xs font-semibold text-[var(--text-primary)]">{item.displayKey}</span>
                                <span className="text-xs text-[var(--text-secondary)] whitespace-pre-line text-right">
                                    {typeof item.value === 'object' && !Array.isArray(item.value)
                                        ? Object.entries(item.value)
                                            .map(([key, val]) => `${key}: ${val}`)
                                            .join(', ')
                                        : Array.isArray(item.value)
                                        ? item.value.join(', ')
                                        : item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 앨범 소개 */}
                {albums.length > 0 && (
                <div className="my-10">
                    <h2 className="section-title">Discography</h2>
                    <div className="relative overflow-x-scroll">
                        <div
                            ref={membersRef}
                            className="flex gap-2 items-center h-full"
                            style={{
                                width: `calc(${members.length} * 200px)`, // 카드 너비 280px 기반으로 계산
                            }}
                        >
                            {albums.sort((a,b) => new Date(b.release_date) - new Date(a.release_date)).map((album, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 w-[200px] h-[200px] bg-[var(--background-muted)] rounded-md shadow-md relative"
                                >
                                    {/* 앨범 사진 */}
                                    <Image
                                        src={album.img_url}
                                        alt={`${album.album_title} Cover`}
                                        fill
                                        sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                                        className="object-cover rounded-md"
                                        loading='lazy'
                                    />
                                    {/* 앨범 정보 */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent text-[var(--text-reverse)]">
                                        <h3 className="text-xs font-bold mb-1">{album.album_title}</h3>
                                        <p className="text-[10px] font-light">
                                            발매일: {album.release_date} | 곡 수: {album.total_songs}
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
                                <div key={index} className="rounded-lg border overflow-hidden flex h-full relative">
                                    {/* Team Member Details */}
                                    <div className="absolute top-4 right-4">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={90}
                                            height={0} // 높이는 자동
                                            sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 23vw"
                                            className="object-cover"
                                            loading='lazy'
                                        />
                                    </div>
                                    <div className="px-4 pt-4 pb-1 flex flex-col justify-center text-left relative">
                                        <div className="flex items-baseline space-x-2 mb-1">
                                            <h3 className="text-xl font-semibold text-[var(--primary)">{member.name}</h3>
                                            <p className="text-xs text-[var(--text-third)]">{member.title}</p>
                                        </div>
                                        <p className="mt-2 text-[11px] font-normal text-[var(--text-secondary)] whitespace-pre-line">{member.experience}</p>
                                        <p className="mt-2 text-xs text-[var(--text-secondary)">{member.introduction}</p>
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
            className="expand-button mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            >
            {isExpanded ? 'Collapse' : 'Expand'}
            </button>
        </div>
    );
};

export default Introduction;