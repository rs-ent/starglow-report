'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReport, useIntroduction } from '../../context/GlobalData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import * as d3 from 'd3';

gsap.registerPlugin(ScrollTrigger);

const Introduction = () => {
    const reportData = useReport();
    const data = useIntroduction();
    
    const catchPhraseRef = useRef(null);
    const subCatchPhraseRef = useRef(null);
    const formattedCatchPhrase = data.catchPhrase.replace(/(.{14})/g, '$1\n');

    const logoRef = useRef(null);
    
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(null);
    const galleryRef = useRef(null);
    
    const formattedIntroduction = data.introduction.split('</p>').filter(Boolean);
    const textBlocksRef = useRef([]);

    const svgRef = useRef(null);
    useEffect(() => {
        const members = data.members || [];
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;
    
        // Generate pie chart data
        const pie = d3.pie().value(() => 1); // Equal slices
        const arcData = pie(members);
    
        // Define arc generator
        const arc = d3.arc()
            .innerRadius(0) // Set to 0 for a pie chart (non-donut)
            .outerRadius(radius);
    
        // Select SVG and clear previous content
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
        // Define clipping paths for each slice
        const defs = svg.append('defs');
        defs.selectAll('clipPath')
            .data(arcData)
            .join('clipPath')
            .attr('id', (d, i) => `clip-${i}`)
            .append('path')
            .attr('d', arc);
    
        // Draw pie chart slices
        svg.selectAll('path')
            .data(arcData)
            .join('path')
            .attr('d', arc)
            .attr('stroke', 'rgba(255,255,255,0.3)')
            .attr('stroke-width', 2)
            .attr('fill', 'none'); // Keep slices invisible if only showing images
    
        // Add images to each slice
        svg.selectAll('image')
            .data(arcData)
            .join('image')
            .attr('xlink:href', (d, i) => members[i]?.profilePicture || '') // Use the profilePicture URL
            .attr('width', width)
            .attr('height', height)
            .attr('x', -width / 2) // Center the image
            .attr('y', -height / 2)
            .attr('preserveAspectRatio', 'xMidYMid slice') // Ensure the image fills the slice
            .attr('clip-path', (d, i) => `url(#clip-${i})`); // Apply clipping path
    }, [data]);

    console.log(data);
    
    useEffect(() => {
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

    const handleGalleryImageClick = (index) => {
        setActiveGalleryIndex(index);
    };

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
                    {data.subCatchPhrase}
                </p>
            </div>

            {/* Logo */}
            <div className="my-10">
                <Image
                    ref={logoRef}
                    src={data.logo}
                    alt="Artist Logo"
                    width={150}
                    height={150}
                    className="mx-auto object-contain"
                    unoptimized // 이미지 최적화 해제
                />
            </div>

            <div
                ref={galleryRef}
                className="flex gap-1 overflow-x-scroll px-4 py-6"
                style={{ scrollBehavior: 'smooth' }}
            >
                {data.galleryImages.map((image, index) => (
                    <div
                        key={index}
                        className={`flex-shrink-0 transition-all duration-300 ${
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
                            width={500}
                            height={500}
                            className={`object-cover rounded-md transition-all h-full w-full ${
                                activeGalleryIndex === index ? 'shadow-xl' : 'opacity-90'
                            }`}
                        />
                    </div>
                ))}
            </div>

            {/* 간단한 소개글 */}
            <div className="py-6 px-4 text-center">
                {formattedIntroduction.map((block, index) => (
                    <div
                        key={index}
                        ref={(el) => (textBlocksRef.current[index] = el)}
                        className={`relative inline-block text-sm font-light text-[var(--text-primary)] mb-4 ${
                            block.trim() === '' ? 'h-4 block' : ''
                        }`}
                        dangerouslySetInnerHTML={{
                            __html: block
                                .replace(
                                    /<strong>(.*?)<\/strong>/g,
                                    `
                                    <span class="font-bold relative inline-block">
                                        <span class="underline absolute left-0 bottom-0 w-full h-1 bg-yellow-300 scale-x-0"></span>
                                        $1
                                    </span>
                                    `
                                )
                                .replace(/<br\s*\/?>/g, '<div class="h-4"></div>'), // <br>을 한 줄 띄움으로 변환
                        }}
                    />
                ))}
            </div>

            {/* 멤버 */}
            <svg ref={svgRef} className="block mx-auto"></svg>
        </div>
    );
};

export default Introduction;