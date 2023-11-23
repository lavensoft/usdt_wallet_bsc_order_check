# USDT BEP-20 WALLET
Toạ bộ API dưới đây đều có thể sử dụng cho các Ví k được tạo bởi hệ thống (Các ví ngoài) nhưng cùng mạng BSC (Binance Smart Chain) thì hoàn toàn có thể lấy thông tin - thực hiện giao dịch.

Các phí sẽ trừ là BNB.

## TẠO VÍ
```
POST: /wallets
```
**Response:**
- address: Địa chỉ ví <br/>
- privateKey: Private key - dùng để thực hiện các giao dịch <br/>

## LẤY THÔNG TIN WALLET
Lấy thông tin số dư trong ví
```
GET: /wallets/WALLET_ADDRESS
```
**Response:**
- bnb: Số dư BNB <br/>
- usdt: số dư USDT <br/>

## LẤY LỊCH SỬ GIAO DỊCH
Lấy lịch sử giao dịch của ví
```
GET: /wallets/WALLET_ADDRESS/transactions
```
**Params:**
- sort: Sắp xếp (desc|asc)
- page: Phân trang
- offset: giới hạn số lượng lấy ra

**Response:**
- timeStamp: Thời gian giao dịch
- from: Địa chỉ ví gửi
- to: Địa chỉ ví nhận
- value: Số lượng Token giao dịch
- tokenName: Tên Token GD
- tokenSymbol: ID Token GD
- gas: Phí GD
- gasPrice: Phí GD

## KIỂM TRA GIAO DỊCH
Kiểm tra các giao dịch nạp tiền từ người dùng
```
GET: /wallets/WALLET_ADDRESS/transactions/check
```
**Params:**
- fromDate: Thời gian bắt đầu tạo đơn ( Để kiểm tra các giao dịch nạp tiền thì bạn sẽ cần truyên lên thời gian mà ngừoi dùng bắt đầu tạo đơn nạp tiền. hệ thống sẽ kiểm tra các GD USDT từ thời gian tạo đơn trở đi để kiểm tra).

**Response**
- amount: Số lượng Token đã nạp vào <br/>

## CHUYỂN TOKEN
Chuyển Token USDT trên mạng Binance Smart Chain - BEP-20
```
POST: /wallets/WALLET_ADDRESS/transfer
```

**Body**
- to: Địa chỉ ví nhận
- amount: Số lượng token cần chuyển đi

**Headers**
- private_key: Private key của ví