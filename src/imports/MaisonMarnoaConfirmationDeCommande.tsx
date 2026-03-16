import svgPaths from "./svg-uyovohlltc";
import imgContainer from "figma:asset/0c58864556de448a55841f2ecf77b4c345ab0ecb.png";
import imgImageBorder from "figma:asset/344653dd65726ff50732b6007b3c98709692ec2b.png";

function Container() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #F1F5F9)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[14px] text-center tracking-[2.8px] uppercase w-[154.48px]">
          <p className="leading-[20px]">Maison Marnoa</p>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[rgba(45,42,32,0.5)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[16px] relative w-full">
          <Button />
          <Heading1 />
          <div className="shrink-0 size-[40px]" data-name="Rectangle" />
        </div>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div className="relative shrink-0 size-[64px]" data-name="Overlay+Border+OverlayBlur">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
        <g data-figma-bg-blur-radius="12" id="Overlay+Border+OverlayBlur">
          <rect fill="var(--fill-0, #D4AF35)" fillOpacity="0.2" height="64" rx="32" width="64" />
          <rect height="63" rx="31.5" stroke="var(--stroke-0, #D4AF35)" strokeOpacity="0.3" width="63" x="0.5" y="0.5" />
          <path d={svgPaths.p277cee00} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
        <defs>
          <clipPath id="bgblur_0_1_1063_clip_path" transform="translate(12 12)">
            <rect height="64" rx="32" width="64" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[rgba(18,17,13,0.4)] inset-0 items-center justify-end pb-[48px] pt-[134px] to-[rgba(18,17,13,0.9)]" data-name="Background">
      <OverlayBorderOverlayBlur />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[256px] mb-[-16px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[152.34%] left-0 max-w-none top-[-26.17%] w-full" src={imgContainer} />
      </div>
      <Background />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[75px] justify-center leading-[37.5px] relative shrink-0 text-[#f1f5f9] text-[30px] text-center w-[237.62px]">
        <p className="mb-0">Merci pour votre</p>
        <p>confiance</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Light',sans-serif] font-light h-[78px] justify-center leading-[26px] relative shrink-0 text-[#94a3b8] text-[16px] text-center w-[334.28px]">
        <p className="mb-0">Votre commande chez Maison Marnoa est</p>
        <p className="mb-0">confirmée. Nous préparons vos articles avec le</p>
        <p>{`plus grand soin et l'attention qu'ils méritent.`}</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[12px] tracking-[1.2px] uppercase w-[182.11px]">
        <p className="leading-[16px]">Détails de la commande</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Semi_Bold',sans-serif] h-[56px] justify-center leading-[28px] not-italic relative shrink-0 text-[#f1f5f9] text-[18px] tracking-[-0.45px] w-[148.8px]">
        <p className="mb-0">Commande #MN-</p>
        <p>82934</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[182.11px]" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] content-stretch flex flex-col items-start pl-[9px] pr-[23.73px] py-[5px] relative rounded-[4px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.2)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[30px] justify-center leading-[15px] relative shrink-0 text-[#d4af35] text-[10px] uppercase w-[67.69px]">
        <p className="mb-0">En</p>
        <p>préparation</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[21px] right-[21px] top-[21px]" data-name="Container">
      <Container5 />
      <OverlayBorder />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-full">
        <p className="leading-[20px]">{`L'Essence de Marnoa`}</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-full">
        <p className="leading-[16px]">Eau de Parfum - 100ml</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Semi_Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#d4af35] text-[16px] w-[61.66px]">
        <p className="leading-[24px]">185,00€</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative w-full">
        <div className="bg-size-[62px_62px] bg-top-left relative rounded-[8px] shrink-0 size-[64px]" data-name="Image+Border" style={{ backgroundImage: `url('${imgImageBorder}')` }}>
          <div aria-hidden="true" className="absolute border border-[#2d2a20] border-solid inset-0 pointer-events-none rounded-[8px]" />
        </div>
        <Container9 />
        <Container12 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[21px] pb-[8px] pt-[17px] right-[21px] top-[113px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(45,42,32,0.5)] border-solid border-t inset-0 pointer-events-none" />
      <Container8 />
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[14px] w-[67.94px]">
          <p className="leading-[20px]">Total réglé</p>
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[20px] w-[78.78px]">
          <p className="leading-[28px]">185,00€</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[21px] pt-[17px] right-[21px] top-[218px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(45,42,32,0.5)] border-solid border-t inset-0 pointer-events-none" />
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[9.333px] relative shrink-0 w-[12.833px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8333 9.33333">
        <g id="Container">
          <path d={svgPaths.p57538c0} fill="var(--fill-0, #1C1A14)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center justify-center left-[21px] px-[16px] py-[12px] right-[21px] rounded-[8px] top-[287px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(212, 175, 53) 0%, rgb(241, 213, 146) 50%, rgb(212, 175, 53) 100%)" }}>
      <Container15 />
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#1c1a14] text-[16px] text-center w-[126.77px]">
        <p className="leading-[24px]">Suivre mon colis</p>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#1c1a14] h-[376px] relative rounded-[12px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#2d2a20] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[20px_0_0_0] rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
      <Container4 />
      <HorizontalBorder />
      <HorizontalBorder1 />
      <Button1 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[17px] right-[17px] top-[49px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[-0.6px] uppercase w-[101.05px]">
        <p className="leading-[16px]">Livraison prévue</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[17px] right-[17px] top-[65px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[96.41px]">
        <p className="leading-[20px]">14 - 16 Octobre</p>
      </div>
    </div>
  );
}

function OverlayBorder1() {
  return (
    <div className="bg-[rgba(28,26,20,0.4)] flex-[1_0_0] min-h-px min-w-px relative rounded-[12px] self-stretch" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[#2d2a20] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute h-[20px] left-[20px] top-[19px] w-[18px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
          <path d={svgPaths.p2a946800} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </svg>
      </div>
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[17px] right-[17px] top-[49px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[-0.6px] uppercase w-[91.23px]">
        <p className="leading-[16px]">Support Client</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[17px] right-[17px] top-[65px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[80.77px]">
        <p className="leading-[20px]">24h/7j dédié</p>
      </div>
    </div>
  );
}

function OverlayBorder2() {
  return (
    <div className="bg-[rgba(28,26,20,0.4)] flex-[1_0_0] min-h-px min-w-px relative rounded-[12px] self-stretch" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[#2d2a20] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute h-[16px] left-[19px] top-[21px] w-[20px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
          <path d={svgPaths.p13e73800} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </svg>
      </div>
      <Container19 />
      <Container20 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex gap-[16px] h-[114px] items-start justify-center pt-[12px] relative shrink-0 w-full" data-name="Container">
      <OverlayBorder1 />
      <OverlayBorder2 />
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 size-[10.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
        <g id="Container">
          <path d={svgPaths.p2b41a9d0} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Container21 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex gap-[0.01px] items-center pt-[20px] relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[14px] text-center tracking-[1.4px] uppercase w-[199.53px]">
        <p className="leading-[20px]">Continuer mes achats</p>
      </div>
      <Margin />
    </div>
  );
}

function Container2() {
  return (
    <div className="mb-[-16px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-center pb-[48px] px-[24px] relative w-full">
          <Heading />
          <Container3 />
          <BackgroundBorder />
          <Container16 />
          <Link />
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip pb-[113px] relative shrink-0 w-full" data-name="Main">
      <Container1 />
      <Container2 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#12110d] content-stretch flex flex-col items-start max-w-[448px] overflow-clip relative shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Background+Shadow">
      <Header />
      <Main />
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
        <g id="Container">
          <path d={svgPaths.p12a32500} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[10px] tracking-[-0.5px] uppercase w-[38.97px]">
        <p className="leading-[15px]">Accueil</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Link">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Container">
          <path d={svgPaths.p11c2d500} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] tracking-[-0.5px] uppercase w-[57.09px]">
        <p className="leading-[15px]">Collection</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Link">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p3faf9100} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] tracking-[-0.5px] uppercase w-[32.03px]">
        <p className="leading-[15px]">Panier</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Link">
      <Container27 />
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] tracking-[-0.5px] uppercase w-[30.86px]">
        <p className="leading-[15px]">Profil</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Link">
      <Container29 />
      <Container30 />
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Link1 />
        <Link2 />
        <Link3 />
        <Link4 />
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(18,17,13,0.95)] bottom-0 content-stretch flex flex-col items-start left-0 max-w-[448px] pb-[24px] pt-[13px] px-[24px] right-0" data-name="Nav">
      <div aria-hidden="true" className="absolute border-[#2d2a20] border-solid border-t inset-0 pointer-events-none" />
      <Container22 />
    </div>
  );
}

export default function MaisonMarnoaConfirmationDeCommande() {
  return (
    <div className="bg-[#12110d] content-stretch flex flex-col items-start relative size-full" data-name="Maison Marnoa - Confirmation de Commande">
      <BackgroundShadow />
      <Nav />
    </div>
  );
}