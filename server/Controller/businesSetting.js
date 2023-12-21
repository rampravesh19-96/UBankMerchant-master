const mysqlcon = require("../config/db_connection");
class BusinesSetting {
  async default(req, res) {
    try {
      const { id } = req.user;
      const { tab } = req.body;
      switch (tab) {
        case "1": {
          const sql ="SELECT bname, trading_dba, blocation, busines_Code, busines_Country, fname, lname, main_contact_email FROM tbl_user WHERE id = ?";
          const sqlForCountry = "SELECT id,name, sortname FROM countries";
          const result = await mysqlcon(sql, [id]);
          const country = await mysqlcon(sqlForCountry);
          res.status(200).json({
            success: true,
            message: "Company Profile",
            result: result[0],
            country,
          });
          break;
        }
        case "2": {
          const sql ="SELECT  solution_apply_for_country, mode_of_solution FROM tbl_user WHERE id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "Solution Apply for country",
            solution_apply_for_country:
              result[0].solution_apply_for_country.split(","),
            mode_of_solution: result[0].mode_of_solution.split(','),
          });
          break;
        }
        case "3": {
          const sql ="SELECT  director1_name, director1_dob, director1_nationality, director2_name, director2_dob, director2_nationality FROM tbl_user WHERE id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "Director's Info",
            result:result[0]
          });
          break;
        }
        case "4": {
          const sql ="select shareholder1_name, shareholder1_dob, shareholder1_nationality, shareholder2_name, shareholder2_dob, shareholder2_nationality FROM tbl_user WHERE id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "Shareholder Info",
            result: result[0],
          });
          break;
        }
        case "5": {
          const sql ="SELECT  website, job_title, company_estimated_monthly_volume, company_avarage_ticket_size FROM tbl_user WHERE id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "Business Info",
            result: result[0],
          });
          break;
        }
        case "6": {
          const sql ="SELECT  settle_currency, wallet_url FROM tbl_user WHERE id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "Settelment Info",
            result: result[0],
          });
          break;
        }
        case "7": {
          const sql = "SELECT  id, secretkey FROM tbl_user WHERE id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "Keys",
            result: result[0],
          });
          break;
        }
        case "8": {
        const sql = "SELECT tbl_login_security.question, tbl_merchnat_answer.answer FROM tbl_login_security INNER JOIN tbl_merchnat_answer ON tbl_login_security.id = tbl_merchnat_answer.question where user_id = ?";
        const sql2 = 'select security_status from tbl_user where id = ?'
        const result = await mysqlcon(sql,[id]);
        const result2 = await mysqlcon(sql2,[id]);
          res.status(200).json({
            success: true,
            message: "Qus And Ans",
            result,
            toggle:{...result2[0]}
          });
          break;
        }
        case "9": {
          const sql = "SELECT merchant_id, upi_id, status, create_on, update_on FROM tbl_upi_block WHERE merchant_id = ?";
          const result = await mysqlcon(sql, [id]);
          res.status(200).json({
            success: true,
            message: "BLock",
            result: result,
          });
          break;
        }case "10": {
          try{
            let {mode_of_solution} = req.user;
            let mode = mode_of_solution.split(',').map((item)=>item.split('.'))
            let sqlCountries = "SELECT id,name, sortname,support_payment_method FROM countries WHERE id in (?)";
            let sqlPayment_method= "SELECT id as mode,name,type FROM `payment_method` WHERE id in(?)";
            let countryResult = await mysqlcon(sqlCountries,[mode.map((item)=>item[0])]);
            let payment_methodResult = await mysqlcon(sqlPayment_method,[mode.map((item)=>item[1])]);
            let data = [] 
            countryResult.forEach((item)=>payment_methodResult.forEach((item2)=>{
              item.support_payment_method.split(',').forEach((item3)=>{
                   if( item3==item2.mode){
                    data.push({country:item.name,sortname:item.sortname,name:item2.name,type:item2.type}) 
                  }
              })
            }))
          res.status(200).json({data});
        }
        catch(error){
          console.log(error) 
            return res.json(500, {
                message: "error occurered",
                error: error,
              });
        }
          break;
        }
       
        default:
          res.status(400).json({
            success: false,
            message: "somthing went wrong",
          });
          break;
      }
    } catch (err) {
      res.status(500).json({
        sussess: false,
        message: err,
      });
    }
  }
  async toggleQNA(req,res){
    try {
     const {id} = req.user

    const {toggle} = req.body
    console.log(toggle);
    if(!toggle){
      return res.status(400).json({message:"Error in Toggle"})
    }
   const sqlToggle = "UPDATE tbl_user SET security_status = ? WHERE id = ?"
   const toggleResult = await mysqlcon(sqlToggle,[toggle,id]);
   res.status(200).json({
    success: true,
    result:"Authentication succesfully changed"
  });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "somthing went wrong",
        error
      });
    }    
  }
  async blockToggle(req,res){
    try {
    const {status,id} = req.body
    if(!status && !id){
      return res.status(400).json({message:"Error in Status change"})
    }
   const sqlToggle = "UPDATE tbl_upi_block SET status = ? WHERE upi_id = ?"
   const result = await mysqlcon(sqlToggle,[status,id]);
   res.status(200).json({
    success: true,
    result:result.changedRows==0?"No Change":"Successfuly Change"
  });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "somthing went wrong",
        error
      });
    }    
  }
  async download(req, res) {
    let user = req.user;
      try {
        let {mode_of_solution} = req.user;
        let mode = mode_of_solution.split(',').map((item)=>item.split('.'))
        let sqlCountries = "SELECT id,name, sortname,support_payment_method FROM countries WHERE id in (?)";
        let sqlPayment_method= "SELECT id as mode,name,type FROM `payment_method` WHERE id in(?)";
        let countryResult = await mysqlcon(sqlCountries,[mode.map((item)=>item[0])]);
        let payment_methodResult = await mysqlcon(sqlPayment_method,[mode.map((item)=>item[1])]);
        let data = [] 
        countryResult.forEach((item)=>payment_methodResult.forEach((item2)=>{
          item.support_payment_method.split(',').forEach((item3)=>{
               if( item3==item2.mode){
                data.push({country:item.name,sortname:item.sortname,name:item2.name,type:item2.type}) 
              }
          })
        }))
      let defaultSql = "SELECT name, email, complete_profile, id, secretkey, bname, trading_dba, blocation, busines_Code, fname, lname, main_contact_email, director1_name, director1_dob, director1_nationality, director2_name, director2_dob, director2_nationality, shareholder1_name, shareholder1_dob, shareholder1_nationality, shareholder2_name, shareholder2_dob, shareholder2_nationality, website, job_title, company_estimated_monthly_volume, company_avarage_ticket_size, settle_currency, wallet_url from tbl_user WHERE id = ?";
      let bcountrySql = "SELECT countries.name FROM countries INNER JOIN tbl_user ON countries.id = tbl_user.busines_Country WHERE tbl_user.id = ?";
      const defaultResult = await mysqlcon(defaultSql, [user.id]);
      const bcountryResult = await mysqlcon(bcountrySql, [user.id]);
      res.status(200).json({
        default: defaultResult,
        buisness_country:bcountryResult,
        countryResult:data
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Somthing went wrong in reports",
      });
    }
  }
}

module.exports = new BusinesSetting();
