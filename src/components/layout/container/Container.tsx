import { ReactNode } from "react";


// Type ek blueprint (rules) hota hai jo batata hai ki kisi variable ya object ke andar kya-kya information honi chahiye aur kis type ki honi chahiye. Name : Text  Age: Number Phone: Number

type ContainerProps = {  
    children: ReactNode;
};

export default function Container({ children }: ContainerProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    );
}