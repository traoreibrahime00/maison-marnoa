import svgPaths from "./svg-s4m7rbm1kl";
import imgAb6AXuCHb0At8BoSNy6PDp4G4McjvlonTVgUxSTpnEh4JowQlXw0Qak3BvOu8OQYbCBavM19Y9QoBjDSmkxa0LiLv35TIbifIcdgHzqcMclsvLfZkrFKoqEa1YvbMAqVg4FYyyjRvcMWfpHd32Rsqhv0EzqyNcQdgh4Hp510YhKNzLTbmtROrK7Ucg5RjSalLdx38Tpl6GjGccdUerhOCqbyYAnFTcCGaPlTyEf0Lj9MyhB97Pu5YdjI9Tso7EDcZuiQAdQoxtuX4U from "figma:asset/e69de80e12f15d32c7fe256585f32e02de5e3f6e.png";

function Container1() {
  return (
    <div className="relative shrink-0 size-[33px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 33">
        <g id="Container">
          <path d={svgPaths.p1e389980} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(212,175,53,0.2)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[80px]" data-name="Overlay">
      <Container1 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col h-[96px] items-start pb-[16px] relative shrink-0 w-[80px]" data-name="Margin">
      <Overlay />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Manrope:Extra_Bold',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#d4af35] text-[24px] tracking-[2.4px] uppercase w-[236.66px]">
        <p className="leading-[32px]">Maison Marnoa</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[14px] w-[150.5px]">
        <p className="leading-[20px]">{`Haute Joaillerie · Abidjan`}</p>
      </div>
    </div>
  );
}

function LogoBrandSection() {
  return (
    <div className="content-stretch flex flex-col items-center py-[24px] relative shrink-0 w-full" data-name="Logo / Brand Section">
      <Margin />
      <Heading />
      <Container2 />
    </div>
  );
}

function Container3() {
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

function Heading2() {
  return (
    <div className="relative shrink-0" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] w-[175.05px]">
          <p className="leading-[28px]">Adresse de livraison</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex gap-[8px] items-center pb-[9px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Container3 />
      <Heading2 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[14px] w-full">
        <p className="leading-[20px]">Nom complet</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bottom-[17px] content-stretch flex flex-col items-start left-[17px] overflow-clip pr-[209.37px] top-[17px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[22px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] w-[114.63px]">
        <p className="leading-[normal]">Jean-Marc Koffi</p>
      </div>
    </div>
  );
}

function Container7() {
  return <div className="absolute bottom-[17px] left-[17px] top-[17px] w-[324px]" data-name="Container" />;
}

function Input() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container6 />
        <Container7 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <Container5 />
      <Input />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[14px] w-full">
        <p className="leading-[20px]">E-mail</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute bottom-[17px] content-stretch flex flex-col items-start left-[17px] overflow-clip pr-[180.17px] top-[17px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[22px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] w-[143.83px]">
        <p className="leading-[normal]">jean@exemple.com</p>
      </div>
    </div>
  );
}

function Container11() {
  return <div className="absolute bottom-[17px] left-[17px] top-[17px] w-[324px]" data-name="Container" />;
}

function Input1() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container10 />
        <Container11 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <Container9 />
      <Input1 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[14px] w-full">
        <p className="leading-[20px]">Téléphone</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bottom-[17px] content-stretch flex flex-col items-start left-[17px] overflow-clip pr-[175.42px] top-[17px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[22px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] w-[148.58px]">
        <p className="leading-[normal]">+225 07 00 00 00 00</p>
      </div>
    </div>
  );
}

function Container14() {
  return <div className="absolute bottom-[17px] left-[17px] top-[17px] w-[324px]" data-name="Container" />;
}

function Input2() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container13 />
        <Container14 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <Container12 />
      <Input2 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Label2 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[14px] w-full">
        <p className="leading-[20px]">Adresse précise / Quartier</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bottom-[17px] content-stretch flex flex-col items-start left-[17px] overflow-clip pr-[106.87px] top-[17px]" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[22px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] w-[217.13px]">
        <p className="leading-[normal]">Cocody, Cité des Arts, Villa 45</p>
      </div>
    </div>
  );
}

function Container17() {
  return <div className="absolute bottom-[17px] left-[17px] top-[17px] w-[324px]" data-name="Container" />;
}

function Input3() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container16 />
        <Container17 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Label3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <Container15 />
      <Input3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container8 />
      <Label3 />
    </div>
  );
}

function SectionShippingAddress() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Section - Shipping Address">
      <HorizontalBorder />
      <Container4 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Container">
          <path d={svgPaths.p146eb80} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading3() {
  return (
    <div className="relative shrink-0" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] w-[152.16px]">
          <p className="leading-[28px]">Mode de livraison</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center pb-[9px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Container18 />
      <Heading3 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[107.84px]">
        <p className="leading-[20px]">Abidjan Express</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-[101.56px]">
        <p className="leading-[16px]">Livraison sous 24h</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container23 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[107.84px]" data-name="Container">
      <Container22 />
      <Margin1 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[14px] w-[77.08px]">
        <p className="leading-[20px]">3.000 FCFA</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container21 />
        <Container24 />
      </div>
    </div>
  );
}

function Label4() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] h-[76px] relative rounded-[12px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border-2 border-[#d4af35] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex items-start justify-center p-[18px] relative size-full">
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[132.17px]">
        <p className="leading-[20px]">National (Intérieur)</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-[102.53px]">
        <p className="leading-[16px]">Livraison 48h - 72h</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container28 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[132.17px]" data-name="Container">
      <Container27 />
      <Margin2 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#d4af35] text-[14px] w-[77.14px]">
        <p className="leading-[20px]">5.000 FCFA</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container26 />
        <Container29 />
      </div>
    </div>
  );
}

function Label5() {
  return (
    <div className="bg-[rgba(212,175,53,0.05)] h-[74px] relative rounded-[12px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex items-start justify-center p-[17px] relative size-full">
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Label4 />
      <Label5 />
    </div>
  );
}

function SectionShippingMethod() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Section - Shipping Method">
      <HorizontalBorder1 />
      <Container19 />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[18px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 18">
        <g id="Container">
          <path d={svgPaths.p53fc80} fill="var(--fill-0, #D4AF35)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading4() {
  return (
    <div className="relative shrink-0" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] w-[181.42px]">
          <p className="leading-[28px]">Options de paiement</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center pb-[9px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Container30 />
      <Heading4 />
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[20px] relative shrink-0 w-[25px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 20">
        <g id="Container">
          <path d={svgPaths.p16679e80} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative">
        <Container32 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[10px] text-center tracking-[-0.25px] uppercase w-[41.02px]">
          <p className="leading-[15px]">Visa/MC</p>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[rgba(212,175,53,0.05)] content-stretch flex flex-col items-center justify-center left-0 pl-[65.98px] pr-[66px] py-[17px] rounded-[12px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Margin3 />
      <Container33 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#f97316] content-stretch flex items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] relative shrink-0 text-[8px] text-center text-white w-[32.92px]">
        <p className="leading-[12px]">ORANGE</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="h-[40px] relative shrink-0 w-[32px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Background />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[10px] text-center tracking-[-0.25px] uppercase w-[75.34px]">
          <p className="leading-[15px]">Orange Money</p>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(212,175,53,0.1)] content-stretch flex flex-col items-center justify-center left-[185px] px-[48.83px] py-[19px] rounded-[12px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#d4af35] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Margin4 />
      <Container34 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#facc15] content-stretch flex items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] relative shrink-0 text-[8px] text-black text-center w-[17.44px]">
        <p className="leading-[12px]">MTN</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="h-[40px] relative shrink-0 w-[32px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Background1 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[10px] text-center tracking-[-0.25px] uppercase w-[53.89px]">
          <p className="leading-[15px]">MTN Momo</p>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[rgba(212,175,53,0.05)] content-stretch flex flex-col items-center justify-center left-0 pl-[59.55px] pr-[59.56px] py-[17px] rounded-[12px] top-[105px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Margin5 />
      <Container35 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#2563eb] content-stretch flex items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] relative shrink-0 text-[8px] text-center text-white w-[21.86px]">
        <p className="leading-[12px]">WAVE</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="h-[40px] relative shrink-0 w-[32px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Background2 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[10px] text-center tracking-[-0.25px] uppercase w-[46.8px]">
          <p className="leading-[15px]">Wave App</p>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[rgba(212,175,53,0.05)] content-stretch flex flex-col items-center justify-center left-[185px] pl-[63.09px] pr-[63.11px] py-[17px] rounded-[12px] top-[105px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.3)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Margin6 />
      <Container36 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[194px] relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function SectionPaymentMethods() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Section - Payment Methods">
      <HorizontalBorder2 />
      <Container31 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] w-full">
          <p className="leading-[28px]">Récapitulatif</p>
        </div>
      </div>
    </div>
  );
}

function Ab6AXuCHb0At8BoSNy6PDp4G4McjvlonTVgUxSTpnEh4JowQlXw0Qak3BvOu8OQYbCBavM19Y9QoBjDSmkxa0LiLv35TIbifIcdgHzqcMclsvLfZkrFKoqEa1YvbMAqVg4FYyyjRvcMWfpHd32Rsqhv0EzqyNcQdgh4Hp510YhKNzLTbmtROrK7Ucg5RjSalLdx38Tpl6GjGccdUerhOCqbyYAnFTcCGaPlTyEf0Lj9MyhB97Pu5YdjI9Tso7EDcZuiQAdQoxtuX4U() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuCHb0At8BoSNy6pDp4g4McjvlonTVgUxSTpnEH4Jow-QLXw0qak3BVOu8oQ_ybCBavM19y9QoBjDSmkxa0LI-lv35tIbifICDGHzqcMclsvLFZkrFKoqEA1YVB-MAqVG4FYyyjRvcMWfpHd32Rsqhv-0EzqyNcQdgh4HP510YhKNzLTbmtROrK7UCG5RJSalLdx38TPL6gjGccdUerhOCqbyYAnFTcCGaPlTyEf0lj9MyhB97Pu5YdjI9Tso7eDcZuiQAdQoxtuX4U">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuCHb0At8BoSNy6PDp4G4McjvlonTVgUxSTpnEh4JowQlXw0Qak3BvOu8OQYbCBavM19Y9QoBjDSmkxa0LiLv35TIbifIcdgHzqcMclsvLfZkrFKoqEa1YvbMAqVg4FYyyjRvcMWfpHd32Rsqhv0EzqyNcQdgh4Hp510YhKNzLTbmtROrK7Ucg5RjSalLdx38Tpl6GjGccdUerhOCqbyYAnFTcCGaPlTyEf0Lj9MyhB97Pu5YdjI9Tso7EDcZuiQAdQoxtuX4U} />
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(212,175,53,0.2)] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[4px] shrink-0 size-[48px]" data-name="Overlay">
      <Ab6AXuCHb0At8BoSNy6PDp4G4McjvlonTVgUxSTpnEh4JowQlXw0Qak3BvOu8OQYbCBavM19Y9QoBjDSmkxa0LiLv35TIbifIcdgHzqcMclsvLfZkrFKoqEa1YvbMAqVg4FYyyjRvcMWfpHd32Rsqhv0EzqyNcQdgh4Hp510YhKNzLTbmtROrK7Ucg5RjSalLdx38Tpl6GjGccdUerhOCqbyYAnFTcCGaPlTyEf0Lj9MyhB97Pu5YdjI9Tso7EDcZuiQAdQoxtuX4U />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[136.06px]">
        <p className="leading-[20px]">{`Robe "Marnoa Gold"`}</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-[87.44px]">
        <p className="leading-[16px]">Taille: M • Qty: 1</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[136.06px]" data-name="Container">
      <Container40 />
      <Container41 />
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Overlay1 />
        <Container39 />
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[91.61px]">
          <p className="leading-[20px]">125.000 FCFA</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[9px] pt-[8px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <Container38 />
      <Container42 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[14px] w-[68.72px]">
        <p className="leading-[20px]">Sous-total</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[86.34px]">
        <p className="leading-[20px]">125.000 FCFA</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex h-[20px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[14px] w-[57.3px]">
        <p className="leading-[20px]">Livraison</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[14px] w-[72.56px]">
        <p className="leading-[20px]">3.000 FCFA</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex h-[20px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Container50() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] w-[110.03px]">
          <p className="leading-[28px]">Total à payer</p>
        </div>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Manrope:Extra_Bold',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#d4af35] text-[24px] w-[160.86px]">
          <p className="leading-[32px]">128.000 FCFA</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder4() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.3)] border-solid border-t inset-0 pointer-events-none" />
      <Container50 />
      <Container51 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container44 />
      <Container47 />
      <HorizontalBorder4 />
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pb-[8px] relative w-full">
        <HorizontalBorder3 />
        <Container43 />
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[21px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 21">
        <g id="Container">
          <path d={svgPaths.p12930f00} fill="var(--fill-0, #201D12)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#d4af35] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.99px] items-center justify-center py-[16px] relative w-full">
        <Container52 />
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#201d12] text-[18px] text-center w-[202.33px]">
          <p className="leading-[28px]">Payer en toute sécurité</p>
        </div>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[10px] relative shrink-0 w-[8px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 10">
        <g id="Container">
          <path d={svgPaths.p5c09f80} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container53() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-center relative w-full">
        <Container54 />
        <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] text-center tracking-[1px] uppercase w-[281.02px]">
          <p className="leading-[15px]">Paiement 100% sécurisé via passerelle agréée</p>
        </div>
      </div>
    </div>
  );
}

function SectionOrderSummary() {
  return (
    <div className="bg-[rgba(212,175,53,0.1)] relative rounded-[16px] shrink-0 w-full" data-name="Section - Order Summary">
      <div aria-hidden="true" className="absolute border border-[rgba(212,175,53,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[25px] relative w-full">
        <Heading5 />
        <Container37 />
        <Button4 />
        <Container53 />
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-start left-0 max-w-[672px] p-[16px] right-0 top-[73px]" data-name="Main">
      <LogoBrandSection />
      <SectionShippingAddress />
      <SectionShippingMethod />
      <SectionPaymentMethods />
      <SectionOrderSummary />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[32px] justify-center leading-[16px] relative shrink-0 text-[#64748b] text-[12px] text-center w-[290.52px]">
        <p className="mb-0">© 2024 Maison Marnoa Haute Couture. Abidjan, Côte</p>
        <p>{`d'Ivoire.`}</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 p-[32px] right-0" data-name="Footer">
      <Container55 />
    </div>
  );
}

function Container57() {
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

function Container56() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container57 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#f1f5f9] text-[18px] text-center tracking-[-0.45px] w-[184.14px]">
        <p className="leading-[28px]">Finaliser la commande</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Heading1 />
      </div>
    </div>
  );
}

function TopNavigation() {
  return (
    <div className="absolute bg-[#201d12] content-stretch flex items-center left-0 pb-[17px] pt-[16px] px-[16px] right-0 top-0" data-name="Top Navigation">
      <div aria-hidden="true" className="absolute border-[rgba(212,175,53,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <Container56 />
      <Container58 />
      <div className="shrink-0 size-[40px]" data-name="Rectangle" />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[1828px] min-h-[1828px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <Main />
      <Footer />
      <TopNavigation />
    </div>
  );
}

export default function MaisonMarnoaPaiement() {
  return (
    <div className="bg-[#201d12] content-stretch flex flex-col items-start relative size-full" data-name="Maison Marnoa - Paiement">
      <Container />
    </div>
  );
}