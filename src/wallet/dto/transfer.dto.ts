export default interface TransferDTO {
  address: string;
  to: string;
  amount: number;
  privateKey: string;
  feePrivKey: string;
}
