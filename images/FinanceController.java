package com.activecargo.rest;

import com.activecargo.config.Status;
import com.activecargo.dao.*;
import com.activecargo.entity.Consignment;
import com.activecargo.entity.Customer;
import com.activecargo.entity.Finance;
import com.activecargo.entity.Transaction;
import net.kaczmarzyk.spring.data.jpa.domain.Equal;
import net.kaczmarzyk.spring.data.jpa.web.annotation.And;
import net.kaczmarzyk.spring.data.jpa.web.annotation.Spec;
import org.apache.http.HttpResponse;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/finance")
public class FinanceController {

    @Autowired
    private final FinanceRepository financeRepository;
    private final ConsignmentRepository consignmentRepository;
    private final CustomerRepository customerRepository;
    private final GlobalRepository globalRepository;
    private final SmsRepository smsRepository;
    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final DeliveryTypeRepository deliveryTypeRepository;

    private static DecimalFormat df = new DecimalFormat("0.00");

    private final Double minimumWeight = 0.2;

    public FinanceController(FinanceRepository financeRepository, ConsignmentRepository consignmentRepository, CustomerRepository customerRepository, GlobalRepository globalRepository, SmsRepository smsRepository, OrderRepository orderRepository, TransactionRepository transactionRepository, DeliveryTypeRepository deliveryTypeRepository) {
        this.financeRepository = financeRepository;
        this.consignmentRepository = consignmentRepository;
        this.customerRepository = customerRepository;
        this.globalRepository = globalRepository;
        this.smsRepository = smsRepository;
        this.orderRepository = orderRepository;
        this.transactionRepository = transactionRepository;
        this.deliveryTypeRepository = deliveryTypeRepository;
    }

    @PostMapping(value = "/add")
    public ResponseEntity<?>addFinance(@RequestParam(value = "owner_id", required = true) Long ownerID,
                                       @RequestParam(value = "weight", required = true) double weight) throws IOException {

        JSONObject jsonObject = new JSONObject();

        Finance finance = new Finance();

        List<Consignment>consignmentList = consignmentRepository.getConsignmentsByFinanceStatusIsTrue();
        Consignment activeConsignment;
        Customer customer;
        if (consignmentList.isEmpty()){

            jsonObject.put("status", "error");
            jsonObject.put("message", "Hech qaysi reysni finans statusi aktiv emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);

        }else if (consignmentList.size()>=2){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bir vaqtning o'zida 2 ta reysning finans statusi aktiv bo'lib qolgan!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }else{
            activeConsignment = consignmentList.get(0);
        }

        if (!customerRepository.existsCustomerById(ownerID)){
            jsonObject.put("status", "error");
            jsonObject.put("message", ownerID + " ID mijoz topilmadi!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }else {
            customer = customerRepository.findCustomerById(ownerID);
        }

        if (orderRepository.getOrdersByOwnerIDAndBoxNumberStartingWith(ownerID, activeConsignment.getName()).isEmpty()){
            jsonObject.put("status", "error");
            jsonObject.put("message", ownerID + " ID mijozning " + activeConsignment.getName() + " reysda hech qanday tovarlari yo'q. Iltimos tekshirib ko'ring!!!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }

        if (weight<=0){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Og'irlikni to'g'ri kiriting!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }

        finance.setOwnerId(ownerID);
        finance.setConsignment(activeConsignment.getName());
        finance.setWeight(weight);
        double usd = 0.0;
        if (activeConsignment.getIsHongKong()){
            usd = weight * activeConsignment.getHongKongRate();
        }else {
            if (weight <= minimumWeight) {
                usd = minimumWeight*10;
            } else if (weight > minimumWeight && weight <= 6) {
                usd = weight*10;
            } else if (weight > 6 && weight <= 40) {
                usd = weight*9.5;
            }  else if (weight > 40) {
                usd = weight*9;
            }
        }

        finance.setSumUsd(usd);
        finance.setSumUzs(usd*activeConsignment.getRate());
        finance.setDebt(usd);
        finance.setDebtUZS(usd*activeConsignment.getRate());
        finance.setPaidUzsCash((double) 0);
        finance.setPaidPlastic((double) 0);
        finance.setPaidUsdCash((double) 0);
        finance.setPaidBankAccount((double) 0);
        finance.setRegisteredDate(new Date());
        finance.setTransactionsCount(0);
        financeRepository.save(finance);

        long numberOfOrders = 0;
        String sms_body = "";

        if (activeConsignment.getSalt() != null){
            String salt = activeConsignment.getSalt();
            List<Consignment> consignmentsBySalt = consignmentRepository.getConsignmentsBySalt(salt);

            for (Consignment consignment:consignmentsBySalt) {
                numberOfOrders += orderRepository.countByOwnerIDAndStatusAndConsignmentStartingWith(ownerID, Status.IN_TASHKENT_WAREHOUSE.getStatus(),  consignment.getName());
            }
            sms_body = "ActiveCargo: Sizning " + salt + " reyslarimizdagi " + numberOfOrders + " ta buyurtmangiz Toshkentdagi ofisimizga keldi. \nOg'irligi " + weight + " kg. \nSizning ID: N" + ownerID + "\nwww.my3.acargo.uz/";
        }else {
            numberOfOrders = orderRepository.countByOwnerIDAndStatusAndConsignmentStartingWith(ownerID, Status.IN_TASHKENT_WAREHOUSE.getStatus(),  activeConsignment.getName());
            sms_body = "ActiveCargo: Sizning " + activeConsignment.getName()+ " reysimizdagi " + numberOfOrders + " ta buyurtmangiz Toshkentdagi ofisimizga keldi. \nOg'irligi " + weight + " kg. \nSizning ID: N" + ownerID + "\nwww.my3.acargo.uz/";
        }

        JSONObject jsonObject1 = new JSONObject();
        jsonObject1.put("phone_number", customer.getUsername());
        jsonObject1.put("body", sms_body);
        jsonObject1.put("code", "");

        SmsController smsController = new SmsController(globalRepository, smsRepository);
        HttpResponse response = smsController.sendSMS(jsonObject1);

        jsonObject.put("status", "ok");
        jsonObject.put("message", "Ma'lumotlar muvaffaqiyatli saqlandi");
        return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
    }

    @GetMapping(value = "/list")
    public ResponseEntity<?>getList(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "500") int size,
                                    @And({
                                            @Spec(path = "ownerId", params = "ownerId", spec = Equal.class)
                                    }) Specification<Finance> spec){

        JSONObject jsonObject = new JSONObject();

        List<Finance> financeList = new ArrayList<Finance>();
        Pageable paging = PageRequest.of(page, size, Sort.by("ownerId").ascending());
        Page<Finance> pageTuts;

        List<Consignment>consignmentList = consignmentRepository.getConsignmentsByFinanceStatusIsTrue();
        Consignment activeConsignment;
        if (consignmentList.isEmpty()){

            jsonObject.put("status", "error");
            jsonObject.put("message", "Hech qaysi reysni finans statusi aktiv emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);

        }else if (consignmentList.size()>=2){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bir vaqtning o'zida 2 ta reysning finans statusi aktiv bo'lib qolgan!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }else{
            activeConsignment = consignmentList.get(0);
        }

        if (spec == null){
            pageTuts = financeRepository.getFinancesByConsignmentOrderByOwnerIdAsc(activeConsignment.getName(), paging);
        }else {
            pageTuts = financeRepository.findAll(spec.and(FinanceSpecs.byConsignment(activeConsignment.getName())), paging);
        }

        financeList = pageTuts.getContent();
        double total_weight = 0.0;
        double total_usd = 0.0;
        double total_uzs = 0.0;
        double total_paid_usd = 0.0;
        double total_paid_uzs = 0.0;
        double total_paid_plastic = 0.0;
        double total_debt_uzs = 0.0;
        double total_debt_usd = 0.0;
        double total_paid_bank_account = 0.0;

        for (Finance finance:financeList) {

            total_weight += finance.getWeight();
            total_usd += finance.getSumUsd();
            total_uzs += finance.getSumUzs();
            total_paid_usd += finance.getPaidUsdCash();
            total_paid_uzs += finance.getPaidUzsCash();
            total_paid_plastic += finance.getPaidPlastic();
            total_paid_bank_account +=finance.getPaidBankAccount();
            total_debt_uzs += finance.getDebtUZS();
            total_debt_usd += finance.getDebt();

        }

        jsonObject.put("activeConsignment", activeConsignment.getName());
        jsonObject.put("totalWeight", df.format(total_weight));
        jsonObject.put("totalUSD", df.format(total_usd));
        jsonObject.put("totalUZS", df.format(total_uzs));
        jsonObject.put("totalPaidUSD", df.format(total_paid_usd));
        jsonObject.put("totalPaidUZS", df.format(total_paid_uzs));
        jsonObject.put("totalPaidPlastic", df.format(total_paid_plastic));
        jsonObject.put("totalPaidBankAccount", df.format(total_paid_bank_account));
        jsonObject.put("totalDebtUZS", df.format(total_debt_uzs));
        jsonObject.put("totalDebtUSD", df.format(total_debt_usd));

        jsonObject.put("currentPage", pageTuts.getNumber());
        jsonObject.put("totalItems", pageTuts.getTotalElements());
        jsonObject.put("totalPages", pageTuts.getTotalPages());
        jsonObject.put("finances", financeList);
        jsonObject.put("status", "ok");
        return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
    }

    @PostMapping(value = "/edit")
    public ResponseEntity<?>editFinance(@RequestParam(value = "weight", required = false) Double weight,
                                        @RequestParam(value = "plastic", required = false) Double plastic,
                                        @RequestParam(value = "usd", required = false) Double usd,
                                        @RequestParam(value = "cash", required = false) Double cash,
                                        @RequestParam(value = "bank_account", required = false) Double bankAccount,
                                        @RequestParam(value = "rate", required = false) Double newRate,
                                        @RequestParam(value = "id", required = true) Long id) throws IOException {

        JSONObject jsonObject = new JSONObject();

        List<Consignment>consignmentList = consignmentRepository.getConsignmentsByFinanceStatusIsTrue();
        Consignment activeConsignment;
        if (consignmentList.isEmpty()){

            jsonObject.put("status", "error");
            jsonObject.put("message", "Hech qaysi reysni finans statusi aktiv emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);

        }else if (consignmentList.size()>=2){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bir vaqtning o'zida 2 ta reysning finans statusi aktiv bo'lib qolgan!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }else{
            activeConsignment = consignmentList.get(0);
        }

        Finance finance = financeRepository.getFinanceById(id);

        if (finance == null){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bu finans ID mavjud emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }

        Integer rate = activeConsignment.getRate();

        // if weight has changed
        if (weight != null){
            if (weight != finance.getWeight()){

                finance.setWeight(weight);
                double usdVal = 0.0;
                if (activeConsignment.getIsHongKong()){
                    usdVal = weight * activeConsignment.getHongKongRate();
                }else {
                    if (weight <= minimumWeight) {
                        usdVal = minimumWeight*10;
                    } else if (weight > minimumWeight && weight <= 6) {
                        usdVal = weight*10;
                    } else if (weight > 6 && weight <= 40) {
                        usdVal = weight*9.5;
                    }  else if (weight > 40) {
                        usdVal = weight*9;
                    }
                }

                finance.setSumUsd(usdVal);
                finance.setSumUzs(usdVal*rate);
                finance.setDebtUZS(finance.getSumUzs() - finance.getPaidPlastic() - finance.getPaidBankAccount() - finance.getPaidUzsCash() - finance.getPaidUsdCash()*rate);
                finance.setDebt(finance.getSumUsd() - finance.getPaidUsdCash() - (finance.getPaidUzsCash()/rate) - (finance.getPaidPlastic()/rate) - (finance.getPaidBankAccount()/rate));

                String sms_body = "";

                if (activeConsignment.getSalt() != null){
                    sms_body = "Hurmatli ActiveCargo mijozi\nSizning " + activeConsignment.getSalt() + " reyslarimizdagi buyurtmalaringiz og'irligi o'zgardi. \nYangi og'irligi " + weight + " kg. \nSizning ID: N"+finance.getOwnerId() + ". Batafsil:\nwww.my3.acargo.uz";
                }else {
                    sms_body = "Hurmatli ActiveCargo mijozi\nSizning " + activeConsignment.getName()+ " reysimizdagi buyurtmalaringiz og'irligi o'zgardi. \nYangi og'irligi " + weight + " kg. \nSizning ID: N"+finance.getOwnerId() + ". Batafsil:\nwww.my3.acargo.uz";
                }

                JSONObject jsonObject1 = new JSONObject();
                jsonObject1.put("phone_number", customerRepository.findCustomerById(finance.getOwnerId()).getUsername());
                jsonObject1.put("body", sms_body);
                jsonObject1.put("code", "");

                SmsController smsController = new SmsController(globalRepository, smsRepository);
                HttpResponse response = smsController.sendSMS(jsonObject1);

                financeRepository.save(finance);
            }
        }

        if (plastic != null){
            finance.setPaidPlastic(plastic);
            finance.setDebtUZS(finance.getSumUzs() - finance.getPaidPlastic() - finance.getPaidUzsCash() -finance.getPaidBankAccount() - finance.getPaidUsdCash()*rate);
            finance.setDebt(finance.getSumUsd() - finance.getPaidUsdCash() - (finance.getPaidUzsCash()/rate) - (finance.getPaidPlastic()/rate) - (finance.getPaidBankAccount()/rate));
            financeRepository.save(finance);
        }

        if (usd != null){
            finance.setPaidUsdCash(usd);
            finance.setDebtUZS(finance.getSumUzs() - finance.getPaidPlastic() - finance.getPaidUzsCash() - finance.getPaidBankAccount() - finance.getPaidUsdCash()*rate);
            finance.setDebt(finance.getSumUsd() - finance.getPaidUsdCash() - (finance.getPaidUzsCash()/rate) - (finance.getPaidPlastic()/rate) - (finance.getPaidBankAccount()/rate));
            financeRepository.save(finance);
        }

        if (cash != null){
            finance.setPaidUzsCash(cash);
            finance.setDebtUZS(finance.getSumUzs() - finance.getPaidPlastic() - finance.getPaidUzsCash()  - finance.getPaidBankAccount() - finance.getPaidUsdCash()*rate);
            finance.setDebt(finance.getSumUsd() - finance.getPaidUsdCash() - (finance.getPaidUzsCash()/rate) - (finance.getPaidPlastic()/rate) - (finance.getPaidBankAccount()/rate));
            financeRepository.save(finance);
        }

        if (bankAccount != null){
            finance.setPaidBankAccount(bankAccount);
            finance.setDebtUZS(finance.getSumUzs() - finance.getPaidPlastic() - finance.getPaidUzsCash() -finance.getPaidBankAccount() - finance.getPaidUsdCash()*rate);
            finance.setDebt(finance.getSumUsd() - finance.getPaidUsdCash() - (finance.getPaidUzsCash()/rate) - (finance.getPaidPlastic()/rate) - (finance.getPaidBankAccount()/rate));
            financeRepository.save(finance);
        }

        if (newRate != null){

            double usdVal = finance.getWeight()*newRate;
            finance.setSumUsd(usdVal);
            finance.setSumUzs(usdVal*rate);
            finance.setDebtUZS(finance.getSumUzs() - finance.getPaidPlastic() - finance.getPaidUzsCash() - finance.getPaidUsdCash()*rate);
            finance.setDebt(finance.getSumUsd() - finance.getPaidUsdCash() - (finance.getPaidUzsCash()/rate) - (finance.getPaidPlastic()/rate));
            financeRepository.save(finance);
        }

        jsonObject.put("message", "Muvaffaqiyatli saqlandi");
        jsonObject.put("status", "ok");
        return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
    }

    @PostMapping(value = "/pay")
    public ResponseEntity<?>payFinance(@RequestParam(value = "plastic", required = false) Double plastic,
                                       @RequestParam(value = "usd", required = false) Double usd,
                                       @RequestParam(value = "cash", required = false) Double cash,
                                       @RequestParam(value = "bank_account", required = false) Double bankAccount,
                                       @RequestParam(value = "id", required = true) Long id,
                                       @RequestParam(value = "comment", required = false) String comment,
                                       @RequestParam(value = "date", required = false) String requestDate) throws ParseException {

        JSONObject jsonObject = new JSONObject();

        Boolean shouldCheckPlastic = false;
        if (comment != null && plastic != null) {
            if (!comment.isEmpty() && plastic != 0) {
                shouldCheckPlastic = true;
            }
        }

        List<Consignment>consignmentList = consignmentRepository.getConsignmentsByFinanceStatusIsTrue();
        Consignment activeConsignment;
        if (consignmentList.isEmpty()){

            jsonObject.put("status", "error");
            jsonObject.put("message", "Hech qaysi reysni finans statusi aktiv emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);

        }else if (consignmentList.size()>=2){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bir vaqtning o'zida 2 ta reysning finans statusi aktiv bo'lib qolgan!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }else{
            activeConsignment = consignmentList.get(0);
        }

        Finance finance = financeRepository.getFinanceById(id);

        if (shouldCheckPlastic){
            List<Transaction> transactionList = transactionRepository.getTransactionsByOwnerIDAndCommentHashEquals(finance.getOwnerId(), getOnlyDigits(comment));
            if (!transactionList.isEmpty()){
                jsonObject.put("status", "error");
                jsonObject.put("message", "Shubhali tranzaksiya!!! Bunday tranzaksiya sistemada bor!!! Izohdagi summa va sanaga etibor bering!!!");
                return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
            }
        }

        Calendar cal = Calendar.getInstance();
        Date date = cal.getTime();
        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

        if (requestDate != null){
            if (!requestDate.isEmpty()) {
                date = dateFormat.parse(requestDate);
            }
        }

        if (finance == null){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bu finans ID mavjud emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }

        Integer rate = activeConsignment.getRate();

        if (plastic != null){
            Double usdValue = plastic/rate;
            finance.setDebt(finance.getDebt() - usdValue);
            finance.setDebtUZS(finance.getDebtUZS()-plastic);
            finance.setPaidPlastic(finance.getPaidPlastic()+plastic);
        }

        if (usd != null){
            finance.setDebt(finance.getDebt() - usd);
            finance.setDebtUZS(finance.getDebtUZS() - usd*activeConsignment.getRate());
            finance.setPaidUsdCash(finance.getPaidUsdCash()+usd);
        }

        if (cash != null){
            Double usdValue = cash/rate;
            finance.setDebt(finance.getDebt() - usdValue);
            finance.setDebtUZS(finance.getDebtUZS()-cash);
            finance.setPaidUzsCash(finance.getPaidUzsCash()+cash);
        }

        if (bankAccount != null){
            Double usdValue = bankAccount/rate;
            finance.setDebt(finance.getDebt() - usdValue);
            finance.setDebtUZS(finance.getDebtUZS()-bankAccount);
            finance.setPaidBankAccount(finance.getPaidBankAccount()+bankAccount);
        }

        finance.setTransactionsCount(finance.getTransactionsCount() + 1);
        financeRepository.save(finance);

        Transaction transaction = new Transaction();
        transaction.setRegisteredDate(date);
        transaction.setFinanceID(finance.getId());
        transaction.setComment(comment);
        transaction.setConsignment(finance.getConsignment());
        transaction.setCash(cash);
        transaction.setPlastic(plastic);
        transaction.setBankAccount(bankAccount);
        transaction.setUsd(usd);
        transaction.setOwnerID(finance.getOwnerId());
        if (shouldCheckPlastic){
            transaction.setCommentHash(getOnlyDigits(comment));
        }
        transactionRepository.save(transaction);

        jsonObject.put("message", "Muvaffaqiyatli saqlandi");
        jsonObject.put("status", "ok");
        return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
    }

    private String getOnlyDigits(String input) {
        StringBuilder sb = new StringBuilder();
        input.chars()
                .mapToObj(c -> (char) c)
                .filter(c -> Character.isDigit(c))
                .forEach(sb::append);
        return sb.toString();
    }

    @PostMapping(value = "/payForCustomer")
    public ResponseEntity<?>payForCustomer(@RequestParam(value = "plastic", required = false) Double plastic,
                                           @RequestParam(value = "usd", required = false) Double usd,
                                           @RequestParam(value = "cash", required = false) Double cash,
                                           @RequestParam(value = "bank_account", required = false) Double bankAccount,
                                           @RequestParam(value = "owner_id", required = true) Long ownerId,
                                           @RequestParam(value = "consignment", required = true) String consignment,
                                           @RequestParam(value = "comment", required = false) String comment,
                                           @RequestParam(value = "date", required = false) String requestDate) throws ParseException {

        JSONObject jsonObject = new JSONObject();

        Boolean shouldCheckPlastic = false;
        if (comment != null && plastic != null) {
            if (!comment.isEmpty() && plastic != 0) {
                shouldCheckPlastic = true;
            }
        }
        Calendar cal = Calendar.getInstance();
        Date date = cal.getTime();
        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

        if (requestDate != null){
            if (!requestDate.isEmpty()) {
                date = dateFormat.parse(requestDate);
            }
        }

        Integer rate = 0;
        List<Finance>financeList = new ArrayList<>();

        if (consignment.contains(",")){
            List<Consignment> consignmentList = consignmentRepository.getConsignmentsBySalt(consignment);

            if (consignmentList.isEmpty()){
                jsonObject.put("status", "error");
                jsonObject.put("message", "Reys mavjud emas!");
                return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
            }

            for (Consignment temp:consignmentList) {
                financeList.addAll(financeRepository.getFinancesByOwnerIdAndAndConsignment(ownerId, temp.getName()));
                if (temp.getRate() != 0 ){
                    rate = temp.getRate();
                }
            }
        }else {

            Consignment activeConsignment = consignmentRepository.getConsignmentByName(consignment);
            financeList = financeRepository.getFinancesByOwnerIdAndAndConsignment(ownerId, activeConsignment.getName());
            if (activeConsignment == null){
                jsonObject.put("status", "error");
                jsonObject.put("message", "Reys mavjud emas!");
                return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
            }
            rate = activeConsignment.getRate();
        }

        if (financeList.isEmpty()){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Bu mijozga ushbu reysda hisob kitob mavjud emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }

        Double leftSum = 0.0;

        if (plastic != null){
            leftSum = plastic;
        }
        if (usd != null){
            leftSum = usd;
        }
        if (cash != null){
            leftSum = cash;
        }

        if (bankAccount != null){
            leftSum = bankAccount;
        }

        for (Finance finance: financeList) {
            Double paidSum = 0.0;

            if (shouldCheckPlastic){
                List<Transaction> transactionList = transactionRepository.getTransactionsByOwnerIDAndCommentHashEquals(finance.getOwnerId(), getOnlyDigits(comment));
                if (!transactionList.isEmpty()){
                    jsonObject.put("status", "error");
                    jsonObject.put("message", "Shubhali tranzaksiya!!! Bunday tranzaksiya sistemada bor!!! Izohdagi summa va sanaga etibor bering!!!");
                    return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
                }
            }

            if (leftSum >= 0){

                Transaction transaction = new Transaction();

                if (plastic != null){
                    if (leftSum - finance.getDebtUZS()>=0){
                        paidSum = finance.getDebtUZS();
                        leftSum = leftSum - paidSum;
                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebtUZS();
                    }

                    Double usdValue = paidSum/rate;
                    finance.setDebt(finance.getDebt() - usdValue);
                    finance.setDebtUZS(finance.getDebtUZS()-paidSum);
                    finance.setPaidPlastic(finance.getPaidPlastic()+paidSum);

                    transaction.setPlastic(paidSum);
                }

                if (usd != null){
                    if (leftSum - finance.getDebt()>=0){
                        paidSum = finance.getDebt();
                        leftSum = leftSum - paidSum;
                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebt();
                    }

                    finance.setDebt(finance.getDebt() - paidSum);
                    finance.setDebtUZS(finance.getDebtUZS()-(paidSum*rate));
                    finance.setPaidUsdCash(finance.getPaidUsdCash()+paidSum);
                    transaction.setUsd(paidSum);
                }

                if (cash != null){
                    if (leftSum - finance.getDebtUZS()>=0){
                        paidSum = finance.getDebtUZS();
                        leftSum = leftSum - paidSum;
                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebtUZS();
                    }

                    Double usdValue = paidSum/rate;
                    finance.setDebt(finance.getDebt() - usdValue);
                    finance.setDebtUZS(finance.getDebtUZS()-paidSum);
                    finance.setPaidUzsCash(finance.getPaidUzsCash()+paidSum);

                    transaction.setCash(paidSum);
                }

                if (bankAccount != null){
                    if (leftSum - finance.getDebtUZS()>=0){
                        paidSum = finance.getDebtUZS();
                        leftSum = leftSum - paidSum;
                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebtUZS();
                    }

                    Double usdValue = paidSum/rate;
                    finance.setDebt(finance.getDebt() - usdValue);
                    finance.setDebtUZS(finance.getDebtUZS()-paidSum);
                    finance.setPaidBankAccount(finance.getPaidBankAccount()+paidSum);

                    transaction.setBankAccount(paidSum);
                }

                finance.setTransactionsCount(finance.getTransactionsCount() + 1);
                financeRepository.save(finance);

                transaction.setOwnerID(finance.getOwnerId());
                transaction.setRegisteredDate(date);
                transaction.setFinanceID(finance.getId());
                transaction.setComment(comment);
                transaction.setConsignment(finance.getConsignment());
                if (shouldCheckPlastic){
                    transaction.setCommentHash(getOnlyDigits(comment));
                }
                if ((transaction.getCash()!= null && transaction.getCash() != 0) || (transaction.getUsd() != null && transaction.getUsd() != 0) || (transaction.getPlastic() != null && transaction.getPlastic() != 0) || (transaction.getBankAccount() != null && transaction.getBankAccount() != 0)) {
                    transactionRepository.save(transaction);
                }
            }
        }

        if (leftSum > 0){
            Finance lastFinance = financeList.get(financeList.size()-1);
            lastFinance.setDebtUZS(leftSum*(-1));
            lastFinance.setDebt((leftSum/rate)*(-1));
            financeRepository.save(lastFinance);
        }

        jsonObject.put("message", "Muvaffaqiyatli saqlandi");
        jsonObject.put("status", "ok");
        return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
    }

    @PostMapping(value = "/payAllDebts")
    public ResponseEntity<?>payAllDebts(@RequestParam(value = "plastic", required = false) Double plastic,
                                        @RequestParam(value = "usd", required = false) Double usd,
                                        @RequestParam(value = "cash", required = false) Double cash,
                                        @RequestParam(value = "bank_account", required = false) Double bankAccount,
                                        @RequestParam(value = "owner_id", required = true) Long ownerId,
                                        @RequestParam(value = "comment", required = false) String comment,
                                        @RequestParam(value = "date", required = false) String requestDate) throws ParseException{

        JSONObject jsonObject = new JSONObject();

        Boolean shouldCheckPlastic = false;
        if (comment != null && plastic != null) {
            if (!comment.isEmpty() && plastic != 0) {
                shouldCheckPlastic = true;
            }
        }

        Calendar cal = Calendar.getInstance();
        Date date = cal.getTime();
        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

        if (requestDate != null){
            if (!requestDate.isEmpty()) {
                date = dateFormat.parse(requestDate);
            }
        }

        Double leftSum = 0.0;

        if (plastic != null){
            leftSum = plastic;
        }
        if (usd != null){
            leftSum = usd;
        }
        if (cash != null){
            leftSum = cash;
        }

        if (bankAccount != null){
            leftSum = bankAccount;
        }

        List<Finance>financeList = financeRepository.getFinancesByOwnerIdAndDebtUZSIsGreaterThan(ownerId, 0.0);

        if (financeList.isEmpty()){
            jsonObject.put("status", "error");
            jsonObject.put("message", "Qarzdorlik mavjud emas!");
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        }


        for (int i = 0; i<financeList.size(); i++) {

            Finance finance = financeList.get(i);

            Consignment consignment = consignmentRepository.getConsignmentByName(finance.getConsignment());

            if (consignment == null){
                jsonObject.put("status", "error");
                jsonObject.put("message", "Reys mavjud emas!");
                return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
            }

            if (shouldCheckPlastic){
                List<Transaction> transactionList = transactionRepository.getTransactionsByOwnerIDAndCommentHashEquals(finance.getOwnerId(), getOnlyDigits(comment));
                if (!transactionList.isEmpty()){
                    jsonObject.put("status", "error");
                    jsonObject.put("message", "Shubhali tranzaksiya!!! Bunday tranzaksiya sistemada bor!!! Izohdagi summa va sanaga etibor bering!!!");
                    return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
                }
            }

            Integer rate = consignment.getRate();

            if (rate == 0){
                jsonObject.put("status", "error");
                jsonObject.put("message", consignment.getName() + " reysiga dollar kursi kiritilmagan!");
                return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
            }

            Double paidSum = 0.0;

            if (leftSum >= 0){
                Transaction transaction = new Transaction();

                if (plastic != null){
                    if (leftSum - finance.getDebtUZS()>=0){
                        paidSum = finance.getDebtUZS();
                        leftSum = leftSum - paidSum;

                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebtUZS();
                    }

                    Double usdValue = paidSum/rate;
                    finance.setDebt(finance.getDebt() - usdValue);
                    finance.setDebtUZS(finance.getDebtUZS()-paidSum);
                    finance.setPaidPlastic(finance.getPaidPlastic()+paidSum);

                    transaction.setPlastic(paidSum);
                }

                if (usd != null){
                    if (leftSum - finance.getDebt()>=0){
                        paidSum = finance.getDebt();
                        leftSum = leftSum - paidSum;

                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebt();
                    }

                    finance.setDebt(finance.getDebt() - paidSum);
                    finance.setDebtUZS(finance.getDebtUZS()-(paidSum*rate));
                    finance.setPaidUsdCash(finance.getPaidUsdCash()+paidSum);

                    transaction.setUsd(paidSum);
                }

                if (cash != null){
                    if (leftSum - finance.getDebtUZS()>=0){
                        paidSum = finance.getDebtUZS();
                        leftSum = leftSum - paidSum;

                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebtUZS();
                    }

                    Double usdValue = paidSum/rate;
                    finance.setDebt(finance.getDebt() - usdValue);
                    finance.setDebtUZS(finance.getDebtUZS()-paidSum);
                    finance.setPaidUzsCash(finance.getPaidUzsCash()+paidSum);

                    transaction.setCash(paidSum);
                }

                if (bankAccount != null){
                    if (leftSum - finance.getDebtUZS()>=0){
                        paidSum = finance.getDebtUZS();
                        leftSum = leftSum - paidSum;

                    }else {
                        paidSum = leftSum;
                        leftSum = leftSum - finance.getDebtUZS();
                    }

                    Double usdValue = paidSum/rate;
                    finance.setDebt(finance.getDebt() - usdValue);
                    finance.setDebtUZS(finance.getDebtUZS()-paidSum);
                    finance.setPaidBankAccount(finance.getPaidBankAccount()+paidSum);

                    transaction.setBankAccount(paidSum);
                }

                finance.setTransactionsCount(finance.getTransactionsCount() + 1);
                financeRepository.save(finance);

                transaction.setOwnerID(finance.getOwnerId());
                transaction.setRegisteredDate(date);
                transaction.setFinanceID(finance.getId());
                transaction.setComment(comment);
                if (shouldCheckPlastic){
                    transaction.setCommentHash(getOnlyDigits(comment));
                }
                transaction.setConsignment(finance.getConsignment());
                transactionRepository.save(transaction);
            }
        }

        if (leftSum > 0){
            Finance lastFinance = financeList.get(financeList.size()-1);
            Consignment consignment = consignmentRepository.getConsignmentByName(lastFinance.getConsignment());
            lastFinance.setDebtUZS(leftSum*(-1));
            lastFinance.setDebt((leftSum/consignment.getRate())*(-1));
            financeRepository.save(lastFinance);
        }

        jsonObject.put("message", "Muvaffaqiyatli saqlandi");
        jsonObject.put("status", "ok");
        return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
    }
}
