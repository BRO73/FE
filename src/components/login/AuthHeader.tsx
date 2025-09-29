import logo from "@/assets/logo.png";

const AuthHeader = () => {
  return (
    <div className="text-center mb-6 px-3">
      <div className="flex justify-center mb-3">
        <img 
          src={logo} 
          alt="KiotViet Logo" 
          className="w-12 h-12 object-contain sm:w-16 sm:h-16"
        />
      </div>
      <h1 className="text-xl font-bold text-text-primary mb-2 sm:text-2xl">
        BRO73
      </h1>
      <p className="text-text-secondary text-sm leading-relaxed">
        Bar - Cafe, Nhà hàng, Karaoke & Billiards
      </p>
    </div>
  );
};

export default AuthHeader;