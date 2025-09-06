import BundleSelector from "../components/BundleSelector";
import AfaRegistration from "../components/AfaRegistration";

export default function Home() {
  return (
    <div className="space-y-8 p-4">
      <BundleSelector
        onSelect={(network, bundle) => {
          console.log("Selected bundle:", network, bundle);
          // ⚡ Call your Paystack API with bundle.price
        }}
      />

      <AfaRegistration
        onRegister={(formData) => {
          console.log("AFA Registration:", formData);
          // ⚡ Charge GHS 8.00 with Paystack here
        }}
      />
    </div>
  );
}
