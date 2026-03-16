import svgPaths from "./svg-1mklzni8po";
import imgImageBorder from "figma:asset/eb4483e5127c05586613a0531a17fe333f33d260.png";

function BackgroundBorder() {
  return (
    <div className="absolute bottom-0 right-0 size-[22.5px]" data-name="Background+Border">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 22.5">
        <g id="Background+Border">
          <rect fill="var(--fill-0, #D4AF35)" height="20.5" rx="10.25" width="20.5" x="1" y="1" />
          <rect height="20.5" rx="10.25" stroke="var(--stroke-0, #201D12)" strokeWidth="2" width="20.5" x="1" y="1" />
          <path d={svgPaths.p26874040} fill="var(--fill-0, #201D12)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="min-h-[128px] pointer-events-none relative rounded-[9999px] shrink-0 size-[128px]" data-name="Image+Border">
        <div className="absolute inset-0 overflow-hidden rounded-[9999px]">
          <img alt="" className="absolute left-[1.56%] max-w-none size-[96.88%] top-[1.56%]" src={imgImageBorder} />
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#d4af35] border-solid inset-0 rounded-[9999px]" />
      </div>
      <BackgroundBorder />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[30px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[24px] text-center tracking-[-0.6px] w-[230.94px]">
        <p className="leading-[30px]">Mme. Sophie Marnoa</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[12.25px] relative shrink-0 w-[9.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 12.25">
        <g id="Container">
          <path d={svgPaths.p24137e00} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Semi_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#d4af35] text-[14px] tracking-[0.7px] uppercase w-[136.44px]">
        <p className="leading-[20px]">Membre Prestige</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[7.99px] items-center relative shrink-0" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Container6 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[14px] w-[198.61px]">
        <p className="leading-[20px]">sophie.m@maisonmarnoa.com</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Container">
      <Container5 />
      <Margin />
      <Margin1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0" data-name="Container">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container2 />
    </div>
  );
}

function ProfileHeroSection() {
  return (
    <div className="absolute content-stretch flex h-[270px] items-start justify-center left-0 p-[24px] right-0 top-[73px]" data-name="Profile Hero Section">
      <Container1 />
    </div>
  );
}

function ParagraphOverlayBorder() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] min-w-[120px] relative rounded-[12px] self-stretch shrink-0 w-[152.56px]" data-name="Paragraph+Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center min-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-center leading-[0] min-w-[inherit] p-[17px] relative size-full text-center">
          <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[30px] justify-center relative shrink-0 text-[#d4af35] text-[24px] w-[24.81px]">
            <p className="leading-[30px]">12</p>
          </div>
          <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[16px] justify-center relative shrink-0 text-[#94a3b8] text-[12px] tracking-[-0.6px] uppercase w-[70.84px]">
            <p className="leading-[16px]">Commandes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParagraphOverlayBorder1() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] min-w-[120px] relative rounded-[12px] self-stretch shrink-0 w-[173.45px]" data-name="Paragraph+Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center min-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-center leading-[0] min-w-[inherit] p-[17px] relative size-full text-center">
          <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[30px] justify-center relative shrink-0 text-[#d4af35] text-[24px] w-[49.09px]">
            <p className="leading-[30px]">2.4k</p>
          </div>
          <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[16px] justify-center relative shrink-0 text-[#94a3b8] text-[12px] tracking-[-0.6px] uppercase w-[91.73px]">
            <p className="leading-[16px]">Points Privilège</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[100px] items-start justify-center left-0 px-[24px] py-[8px] right-0 top-[343px]" data-name="Stats Grid">
      <ParagraphOverlayBorder />
      <ParagraphOverlayBorder1 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[14px] tracking-[2.8px] uppercase w-full">
        <p className="leading-[20px]">Espace Client</p>
      </div>
    </div>
  );
}

function Heading3Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0 w-full" data-name="Heading 3:margin">
      <Heading1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[16px] w-[204.39px]">
        <p className="leading-[24px]">Informations Personnelles</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-[188.05px]">
        <p className="leading-[16px]">Gérer vos données et préférences</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[204.39px]" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Overlay />
        <Container11 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SectionInformationsPersonnelles() {
  return (
    <div className="bg-[rgba(30,41,59,0.4)] relative rounded-[12px] shrink-0 w-full" data-name="Section: Informations Personnelles">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container9 />
          <Container14 />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[20px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="Container">
          <path d={svgPaths.p396ca1c0} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[16px] w-[213.77px]">
        <p className="leading-[24px]">Historique des Commandes</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-[186.63px]">
        <p className="leading-[16px]">Suivre et revoir vos achats passés</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[213.77px]" data-name="Container">
      <Container18 />
      <Container19 />
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Overlay1 />
        <Container17 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SectionHistoriqueDesCommandes() {
  return (
    <div className="bg-[rgba(30,41,59,0.4)] relative rounded-[12px] shrink-0 w-full" data-name="Section: Historique des Commandes">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container15 />
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p1869180} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container22 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[16px] w-[174.75px]">
        <p className="leading-[24px]">Adresses Enregistrées</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-[185.3px]">
        <p className="leading-[16px]">Modifier vos adresses de livraison</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[185.3px]" data-name="Container">
      <Container24 />
      <Container25 />
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Overlay2 />
        <Container23 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SectionAdressesEnregistrees() {
  return (
    <div className="bg-[rgba(30,41,59,0.4)] relative rounded-[12px] shrink-0 w-full" data-name="Section: Adresses Enregistrées">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container21 />
          <Container26 />
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[16px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
        <g id="Container">
          <path d={svgPaths.p25774b00} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container28 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[16px] w-[159.53px]">
        <p className="leading-[24px]">Moyens de Paiement</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-[180.92px]">
        <p className="leading-[16px]">Cartes bancaires et portefeuilles</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[180.92px]" data-name="Container">
      <Container30 />
      <Container31 />
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Overlay3 />
        <Container29 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SectionMoyensDePaiement() {
  return (
    <div className="bg-[rgba(30,41,59,0.4)] relative rounded-[12px] shrink-0 w-full" data-name="Section: Moyens de Paiement">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container27 />
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p3e9df400} fill="var(--fill-0, #EF4444)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function LogoutButton() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Logout Button">
      <div aria-hidden="true" className="absolute border border-[rgba(239,68,68,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center p-[17px] relative w-full">
          <Container33 />
          <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#ef4444] text-[16px] text-center w-[102.14px]">
            <p className="leading-[24px]">Déconnexion</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoutButtonMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[32px] relative shrink-0 w-full" data-name="Logout Button:margin">
      <LogoutButton />
    </div>
  );
}

function SectionsMenu() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 p-[24px] right-0 top-[443px]" data-name="Sections Menu">
      <Heading3Margin />
      <SectionInformationsPersonnelles />
      <SectionHistoriqueDesCommandes />
      <SectionAdressesEnregistrees />
      <SectionMoyensDePaiement />
      <LogoutButtonMargin />
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container35 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative w-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[45px] justify-center leading-[22.5px] relative shrink-0 text-[#f1f5f9] text-[18px] text-center tracking-[1.8px] uppercase w-[210.4px]">
          <p className="mb-0">Mon Profil Maison</p>
          <p>Marnoa</p>
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex h-[48px] items-center justify-center relative rounded-[8px] shrink-0" data-name="Button">
      <Container37 />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-end relative w-full">
        <Button />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-[#201d12] content-stretch flex items-center justify-between left-0 pb-[9px] pt-[16px] px-[16px] right-0 top-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <Container34 />
      <Heading />
      <Container36 />
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
        <g id="Container">
          <path d={svgPaths.p12a32500} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center relative shrink-0" data-name="Container">
      <Container40 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase w-[48.23px]">
        <p className="leading-[15px]">Accueil</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-end min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container39 />
      <Container41 />
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[18px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 18">
        <g id="Container">
          <path d={svgPaths.p263c3400} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center relative shrink-0" data-name="Container">
      <Container43 />
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase w-[70.42px]">
        <p className="leading-[15px]">Collection</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-end min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container42 />
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[18.35px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18.35">
        <g id="Container">
          <path d={svgPaths.p279a9400} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center relative shrink-0" data-name="Container">
      <Container46 />
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] tracking-[1px] uppercase w-[46.25px]">
        <p className="leading-[15px]">Favoris</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-end min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container45 />
      <Container47 />
    </div>
  );
}

function Container49() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p301d5280} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center relative shrink-0" data-name="Container">
      <Container49 />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[10px] tracking-[1px] uppercase w-[38.66px]">
        <p className="leading-[15px]">Profil</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-end min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container48 />
      <Container50 />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[51px] max-w-[448px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-start justify-center max-w-[inherit] relative size-full">
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function BottomNavigationBar() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(32,29,18,0.95)] bottom-0 content-stretch flex flex-col items-start left-0 pb-[24px] pt-[9px] px-[16px] right-0" data-name="Bottom Navigation Bar">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <Container38 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[1049px] min-h-[1049px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <ProfileHeroSection />
      <StatsGrid />
      <SectionsMenu />
      <div className="absolute h-[96px] left-0 right-0 top-[953px]" data-name="Spacing for Bottom Bar" />
      <Header />
      <BottomNavigationBar />
    </div>
  );
}

export default function MaisonMarnoaProfilUtilisateur() {
  return (
    <div className="bg-[#201d12] content-stretch flex flex-col items-start relative size-full" data-name="Maison Marnoa - Profil Utilisateur">
      <Container />
    </div>
  );
}