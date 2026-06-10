'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ravan-section.css';

interface WeaponItem {
    key: string;
    title: string;
    domain: string;
    img: string;
    text: string;
}

const WEAPON_DATA: Record<string, WeaponItem> = {
    trishul: { key: 'trishul', title: 'TRISHUL SPEAR', domain: 'DIVINE WEAPON OF STRENGTH', img: '/images/SimpleAssets/weapons/trishul-spear.png', text: 'The sacred trident representing creation, preservation, and destruction.' },
    khanda: { key: 'khanda', title: 'KHANDA SWORD', domain: 'BLADE OF RIGHTEOUSNESS', img: '/images/SimpleAssets/weapons/khanda-sword.png', text: 'A double-edged straight sword of immense power and precision.' },
    shield: { key: 'shield', title: 'DHAL SHIELD', domain: 'AEGIS OF PROTECTION', img: '/images/SimpleAssets/weapons/dhal-shield.png', text: 'An impenetrable folk-art shield forged to withstand cosmic strikes.' },
    bow: { key: 'bow', title: 'BOW OF AGNI', domain: 'CELESTIAL ARCHERY', img: '/images/SimpleAssets/weapons/bow-arrow-crossed.png', text: 'Crossed fiery bows capable of launching elemental arrows across realms.' },
    axe: { key: 'axe', title: 'PARASHU AXE', domain: 'MIGHT OF THE EARTH', img: '/images/SimpleAssets/weapons/parashu-axe.png', text: 'The battle-axe imbued with terrifying strength and swift judgment.' },
    hammer: { key: 'hammer', title: 'WAR HAMMER', domain: 'THUNDER STRANGER', img: '/images/SimpleAssets/weapons/war-hammer.png', text: 'A heavy war hammer engineered to shatter mountains and heavy defenses.' },
    chakram: { key: 'chakram', title: 'SUDARSHANA CHAKRAM', domain: 'ROTATING DISC OF SUN', img: '/images/SimpleAssets/weapons/chakram.png', text: 'The spinning weapon of cosmic energy that slices through any illusion.' },
    katar: { key: 'katar', title: 'KATAR DAGGER', domain: 'SHADOW & SWIFTNESS', img: '/images/SimpleAssets/weapons/katar.png', text: 'The push dagger designed for fast, lethal close-quarters combat.' }
};

const DANCE_FRAMES = [
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/00-original-dance-pose.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/01-araimandi-natyarambha.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/02-anjali-samapada.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/03-natta-adavu.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/04-kuditta-mettu.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/05-alidha-lunge.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/06-mandi-kneeling-pose.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/07-tatta-adavu-preparation.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/08-visharu-diagonal-step.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/09-pushpaputa-offering.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/10-swastika-crossed-stance.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/11-utsanga-embrace.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/12-shikhara-archer.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/13-mayura-peacock-balance.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/14-bhramari-turning-pose.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/15-alapadma-blossom.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/16-korvai-finishing-pose.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/17-tribhanga-curve.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/18-kartarimukha-separation.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/19-kunchita-foot-stamp.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/20-garuda-wing-stance.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/21-gaja-hasta.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/22-chakra-turning-step.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/23-pataka-command.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/24-sarpashirsha-serpentine.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/25-veera-kneeling-lunge.png',
    '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/26-overhead-anjali-finish.png'
];

export default function RavanSection() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMandalaHidden, setIsMandalaHidden] = useState(false);
    const [isShivaAvatar, setIsShivaAvatar] = useState(false);
    const [isAvatarFading, setIsAvatarFading] = useState(false);
    const [danceFrameIndex, setDanceFrameIndex] = useState(0);
    const [isDanceBtnClicked, setIsDanceBtnClicked] = useState(false);
    const [activeWeapon, setActiveWeapon] = useState<WeaponItem | null>(null);

    useEffect(() => {
        DANCE_FRAMES.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    const toggleBGM = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.log(err));
        }
    };

    const handleShivaToggle = () => {
        setIsAvatarFading(true);
        setTimeout(() => {
            setIsShivaAvatar((prev) => !prev);
            setIsAvatarFading(false);
        }, 220);
    };

    const handleDanceStepToggle = () => {
        setDanceFrameIndex((prev) => (prev + 1) % DANCE_FRAMES.length);
        setIsDanceBtnClicked(true);
        setTimeout(() => setIsDanceBtnClicked(false), 250);
    };

    return (
        <div className={`ravan-ui-container ${isDarkMode ? 'ravan-dramatic-dark' : ''}`}>
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} width="0" height="0">
                <filter id="chromakey-filter">
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.5 -2.5 1.5 1 0" />
                </filter>
            </svg>

            <audio ref={audioRef} src="/Music/Bhoomiya Rakshaka.mp3" loop preload="none" />

            <button
                className={`ravan-bgm-pure-icon-btn ${isPlaying ? 'playing' : ''}`}
                onClick={toggleBGM}
                aria-label="Toggle Background Music"
                title="Play/Pause BGM"
            >
                <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r2_c10.png" alt="BGM Emblem" className="ravan-bgm-icon-img" loading="lazy" />
            </button>

            <div className="ravan-bg-layer" style={{ backgroundImage: "url('/images/SimpleAssets/backgrounds/ravan-background-hd.png')" }} />

            <div className="ravan-hero-stage" id="ravan-hero">
                <img src="/images/SimpleAssets/ui/ornamental-frame.png" className="ravan-ornamental-frame" alt="Ornate Border Frame" loading="lazy" />

                <div className="ravan-hero-centerpiece">
                    <img src="/images/SimpleAssets/ui/mandala-circle.png" alt="Mandala Circle" className={`ravan-mandala-disc ${isMandalaHidden ? 'ravan-hidden-fade' : ''}`} loading="lazy" />
                    <div className="ravan-character-container">
                        <img src="/images/SimpleAssets/ui/ravan-character.png" alt="Ravan Character" className="ravan-character-art" loading="lazy" />
                        <div className="ravan-eye-blink-container">
                            <img src="/images/Blinking/open.png" alt="Eye Open" className="ravan-eye-frame frame-open" loading="lazy" />
                            <img src="/images/Blinking/closed.png" alt="Eye Closed" className="ravan-eye-frame frame-closed" loading="lazy" />
                        </div>
                    </div>
                </div>

                <div className="ravan-fire-left"><img src="/images/SimpleAssets/ui/fire-left.png" alt="Flame Left" loading="lazy" /></div>
                <div className="ravan-fire-right"><img src="/images/SimpleAssets/ui/fire-right.png" alt="Flame Right" loading="lazy" /></div>
            </div>

            <div className="ravan-main-content">
                <section className="ravan-section" id="ravan-kailash-saga">
                    <div className="kailash-scene-container">
                        <img src="/images/ravan-kailash-elements/mountain-jungle-filler-pack/03-distant-mountain-range.png" alt="Distant Mountain" className="kailash-filler kailash-filler-distant" loading="lazy" />
                        <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/04-soil-rock-root-cascade.png" alt="Soil Cascade" className="kailash-debris debris-soil-cascade" loading="lazy" />
                        <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/02-uprooted-falling-tree.png" alt="Uprooted Tree" className="kailash-debris debris-tree-uprooted" loading="lazy" />
                        <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/03-falling-broken-tree.png" alt="Broken Tree" className="kailash-debris debris-tree-broken" loading="lazy" />
                        <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/05-falling-branches-leaves.png" alt="Falling Leaves" className="kailash-debris debris-falling-leaves" loading="lazy" />
                        <img src="/images/ravan-kailash-elements/mountain-jungle-filler-pack/06-falling-rocks-small.png" alt="Small Rocks" className="kailash-filler kailash-filler-rocks-sm" loading="lazy" />
                        <img src="/images/ravan-kailash-elements/mountain-jungle-filler-pack/07-falling-rocks-large.png" alt="Large Rocks" className="kailash-filler kailash-filler-rocks-lg" loading="lazy" />

                        <div className="kailash-center-composition">
                            <img src="/images/ravan-kailash-elements/04-mount-kailash-platform.png" alt="Mount Kailash Platform" className="kailash-png-layer kailash-layer-platform" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/01-wide-torn-earth-hanging-roots.png" alt="Torn Earth Main" className="kailash-png-layer debris-torn-earth debris-torn-earth-main" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/01-wide-torn-earth-hanging-roots.png" alt="Torn Earth Left" className="kailash-png-layer debris-torn-earth debris-torn-earth-left" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/01-wide-torn-earth-hanging-roots.png" alt="Torn Earth Right" className="kailash-png-layer debris-torn-earth debris-torn-earth-right" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/01-wide-torn-earth-hanging-roots.png" alt="Torn Earth Far Left" className="kailash-png-layer debris-torn-earth debris-torn-earth-far-left" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/ripped-mountain-debris-pack/01-wide-torn-earth-hanging-roots.png" alt="Torn Earth Far Right" className="kailash-png-layer debris-torn-earth debris-torn-earth-far-right" loading="lazy" />

                            <img src="/images/ravan-kailash-elements/06-deer-pair.png" alt="Deer Pair" className="kailash-png-layer kailash-layer-deer" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/07-birds.png" alt="Birds" className="kailash-png-layer kailash-layer-birds" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/01-shiva.png" alt="Lord Shiva" className="kailash-png-layer kailash-layer-shiva" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/02-goddess.png" alt="Goddess Parvati" className="kailash-png-layer kailash-layer-goddess" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/10-flowers-rocks-overlay.png" alt="Flowers & Rocks" className="kailash-png-layer kailash-layer-flowers" loading="lazy" />
                            <img src="/images/ravan-kailash-elements/03-ravan-five-heads-lifting.png" alt="Ravan Lifting Mount Kailash" className="kailash-png-layer kailash-layer-ravan" loading="lazy" />
                        </div>
                    </div>
                </section>

                <section className="ravan-section" id="nataraja-dance-saga">
                    <div className="nataraja-scene-container">
                        <img src="/images/SimpleAssets/nataraja-separated-elements/natarajan-folk-mandala-transparent.png" alt="Nataraja Mandala" className={`nataraja-layer nataraja-layer-folk-mandala ${isMandalaHidden ? 'ravan-hidden-fade' : ''}`} loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/06-top-flame-lotus-emblem.png" alt="Top Flame Lotus Emblem" className="nataraja-layer nataraja-layer-top-emblem" loading="lazy" />

                        <img
                            src={isShivaAvatar ? '/images/SimpleAssets/nataraja-separated-elements/Shiva_Nataraja_Transparent.png' : '/images/SimpleAssets/nataraja-separated-elements/01-nataraja-character.png'}
                            alt="Nataraja Character"
                            className={`nataraja-layer nataraja-layer-character ${isAvatarFading ? 'avatar-fade' : ''}`}
                            data-is-shiva={isShivaAvatar ? 'true' : 'false'}
                            loading="lazy"
                        />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/05-apasmara-dwarf.png" alt="Apasmara Dwarf" className="nataraja-layer nataraja-layer-dwarf" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/04-nataraja-lotus-pedestal.png" alt="Lotus Pedestal" className="nataraja-layer nataraja-layer-pedestal" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Left.png" alt="Left Holder 1" className="nataraja-layer nataraja-layer-flame-left flame-left-1" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Large/Left.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-a fire-left-1" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Large/Right.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-b fire-left-1" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Left.png" alt="Left Holder 2" className="nataraja-layer nataraja-layer-flame-left flame-left-2" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Medium/Left.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-a fire-left-2" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Medium/Right.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-b fire-left-2" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Left.png" alt="Left Holder 3" className="nataraja-layer nataraja-layer-flame-left flame-left-3" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Small/Left.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-a fire-left-3" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Small/Right.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-b fire-left-3" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Right.png" alt="Right Holder 1" className="nataraja-layer nataraja-layer-flame-right flame-right-1" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Large/Left.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-a fire-right-1" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Large/Right.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-b fire-right-1" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Right.png" alt="Right Holder 2" className="nataraja-layer nataraja-layer-flame-right flame-right-2" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Medium/Left.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-a fire-right-2" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Medium/Right.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-b fire-right-2" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Right.png" alt="Right Holder 3" className="nataraja-layer nataraja-layer-flame-right flame-right-3" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Small/Left.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-a fire-right-3" loading="lazy" />
                        <img src="/images/SimpleAssets/nataraja-separated-elements/Complete_Flame_PNG_Set_v2/Small/Right.png" alt="Fire Overlay" className="nataraja-layer nataraja-layer-fire-overlay flame-frame-b fire-right-3" loading="lazy" />

                        <img src="/images/SimpleAssets/nataraja-separated-elements/10-dancer-stage-platform.png" alt="Dancer Platform" className="nataraja-layer nataraja-layer-stage" loading="lazy" />

                        <img src={DANCE_FRAMES[danceFrameIndex]} alt="Bharatanatyam Dancer" className="nataraja-layer nataraja-layer-dancer" loading="lazy" />

                        <div className="ravan-folk-nav-dock">
                            <button className="ravan-dock-btn" onClick={() => setIsMandalaHidden((prev) => !prev)} title="Toggle Mandala Ring" aria-label="Toggle Mandala Ring">
                                <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r2_c4.png" alt="Toggle Mandala" className="ravan-dock-icon" />
                            </button>
                            <button className="ravan-dock-btn" onClick={handleShivaToggle} title="Toggle Shiva Avatar" aria-label="Toggle Shiva Avatar">
                                <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r2_c5.png" alt="Toggle Shiva Avatar" className="ravan-dock-icon" />
                            </button>
                            <button className="ravan-dock-btn" onClick={() => setIsDarkMode((prev) => !prev)} title="Toggle Dark Mode" aria-label="Toggle Dark Mode">
                                <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r2_c6.png" alt="Toggle Dark Mode" className="ravan-dock-icon" />
                            </button>
                            <button className={`ravan-dock-btn ravan-dance-btn ${isDanceBtnClicked ? 'is-clicked' : ''}`} onClick={handleDanceStepToggle} title="Toggle Dance Step" aria-label="Toggle Dance Step">
                                <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r2_c7.png" alt="Toggle Dance Step" className="ravan-dock-icon" />
                            </button>
                        </div>
                    </div>
                </section>

                <div className="nataraja-section-divider">
                    <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r2_c1 copy 2.png" alt="Section Divider" className="nataraja-divider-img" loading="lazy" />
                </div>

                <section className="ravan-section" id="ravan-arsenal">
                    <div className="ravan-weapons-grid">
                        {Object.values(WEAPON_DATA).map((w) => (
                            <div key={w.key} className="ravan-weapon-card" onClick={() => setActiveWeapon(w)}>
                                <div className="ravan-weapon-img-wrap">
                                    <img src={w.img} alt={w.title} className="ravan-weapon-img" loading="lazy" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="ravan-section" id="ravan-story-chronicles">
                    <div className="ravan-story-grid">
                        {['CHAPTER I', 'CHAPTER II', 'CHAPTER III', 'CHAPTER IV', 'CHAPTER V', 'CHAPTER VI', 'CHAPTER VII', 'CHAPTER VIII', 'CHAPTER IX'].map((ch, idx) => (
                            <div key={idx} className="ravan-story-card">
                                <img src="/images/SimpleAssets/ui/ravan-ui-elements-transparent_r3_c2.png" alt="Story Scroll" className="ravan-story-scroll-bg" loading="lazy" />
                                <div className="ravan-story-content">
                                    <div className="ravan-story-chapter">{ch}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className={`ravan-weapon-modal ${activeWeapon ? 'active' : ''}`} onClick={() => setActiveWeapon(null)}>
                {activeWeapon && (
                    <div className="ravan-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="ravan-modal-close" onClick={() => setActiveWeapon(null)} aria-label="Close modal">&times;</button>
                        <div className="ravan-modal-header">
                            <img src={activeWeapon.img} alt={activeWeapon.title} />
                            <div>
                                <h3 className="ravan-modal-title">{activeWeapon.title}</h3>
                                {activeWeapon.domain && <div className="ravan-modal-subtitle">{activeWeapon.domain}</div>}
                            </div>
                        </div>
                        {activeWeapon.text && <div className="ravan-modal-text">{activeWeapon.text}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
