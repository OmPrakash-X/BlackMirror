import { ThreeElements } from "@react-three/fiber";

declare module "react/jsx-runtime" {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface IntrinsicElements extends ThreeElements { }
    }
}
