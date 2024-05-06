const express = require('express')
var bodyParser = require('body-parser')
var mysql = require('mysql');
var LocalStorage = require('node-localstorage').LocalStorage;

const app = express()

localStorage = new LocalStorage('./scratch');

var con = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'student_result'
});

con.connect();

app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
      res.render('login')
})

app.get('/student', function (req, res) {
      res.render('studentlogin')
})

app.post('/student', function (req, res) {
      let std = req.body.std;
      let div = req.body.div;
      let rollno = req.body.rollno;
      let query = "select * from student where std='" + std + "' and division='" + div + "' and rollno='" + rollno + "'";
      con.query(query, function (error, result, ind) {
            if (error) throw error;
            console.log(result);
            if (result.length == 1) {
                  let obj = { std, div, rollno }
                  localStorage.setItem('student', JSON.stringify(obj))
                  res.redirect('/student/studentdashboard')
            } else if (result.length == 0) {
                  res.send("Student is Not in Database");
            } else if (result.length > 1) {
                  res.send("Multiple Studentd Available");
            }
      })
})

app.get('/student/studentdashboard', function (req, res) {
      let data = localStorage.getItem('student');
      data = JSON.parse(data);
      let query = "select * from result where std='" + data.std + "' and division='" + data.div + "' and rollno='" + data.rollno + "'";
      con.query(query, function (error, result, ind) {
            if (error) throw error;
            if (result.length == 1) {
                  res.render('studentdashboard', { result })
            } else if (result.length == 0) {
                  res.send("Studentd Result Are Not Available");
            } else if (result.length > 1) {
                  res.send("Multiple Studentd Available")
            }
      })
})

app.get('/student/logout', function (req, res) {
      localStorage.removeItem('student');
      res.redirect('/');
})

app.get('/staff', function (req, res) {
      res.render('stafflogin')
})

app.post('/staff', function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      let query = "select * from staff where email='" + email + "' and password='" + password + "'";
      con.query(query, function (error, result, ind) {
            if (error) throw error
            if (result.length == 1) {
                  res.redirect('/staff/staffdashboard')
                  localStorage.setItem('staff', JSON.stringify(result[0]))
            } else {
                  res.redirect('/staff')
            }
      })
})

app.get('/staff/logout', function (req, res) {
      localStorage.removeItem('staff')
      res.redirect('/')
})

app.get('/staff/staffdashboard', function (req, res) {
      res.render('staffdashboard')
})

app.get('/staff/staffdashboard/viewstudentstaff', function (req, res) {
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "select * from student where std='" + data.class + "'and division='" + data.division + "'";
      con.query(query, function (error, result, ind) {
            if (error) throw error
            console.log(result);
            res.render('viewstudentstaff', { result })
      })
})

app.get('/staff/staffdashboard/createresult', function (req, res) {
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let meaasge = '';
      let query = "select rollno from student where std='" + data.class + "'and division='" + data.division + "'";
      con.query(query, function (error, result, ind) {
            if (error) throw error
            console.log(result);
            res.render('createresult', { result, meaasge })
      })
})

app.post('/staff/staffdashboard/createresult', function (req, res) {
      let roll = req.body.roll;
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let meaasge = '';
      let s1 = req.body.s1;
      let s2 = req.body.s2;
      let s3 = req.body.s3;
      let s4 = req.body.s4;
      let s5 = req.body.s5;
      let s6 = req.body.s6;
      let s7 = req.body.s7;
      let sum = Number(s1) + Number(s2) + Number(s3) + Number(s4) + Number(s5) + Number(s6) + Number(s7);
      let min = Math.min(Number(s1), Number(s2), Number(s3), Number(s4), Number(s5), Number(s6), Number(s7));
      let max = Math.max(Number(s1), Number(s2), Number(s3), Number(s4), Number(s5), Number(s6), Number(s7));
      let arr = new Array(Number(s1), Number(s2), Number(s3), Number(s4), Number(s5), Number(s6), Number(s7));
      let temp = arr.filter((values, index, Array) => {
            return values > 33
      })
      let resu = 'FAILL';
      if (temp.length == 7) {
            resu = "PASS"
      } else if (temp.length >= 5) {
            resu = 'ATKT'
      }
      let query = "select * from student where std='" + data.class + "' and division='" + data.division + "' and rollno=" + roll;
      con.query(query, function (error, result, ind) {
            if (error) throw error
            if (result.length != 1) {
                  alert('data not saved');
                  res.redirect('/staff/staffdashboard/createresult')
            } else {
                  query = "select * from result where std='" + data.class + "' and division='" + data.division + "' and rollno=" + roll;
                  con.query(query, function (error2, result2, ind2) {
                        if (error2) throw error2
                        if (result2.length > 0) {
                              res.send("Roll No Data are exist")
                        } else {
                              query = "insert into result(name,std,division,rollno,s1,s2,s3,s4,s5,s6,s7,minimum,maximum,resu,total) values('" + result[0].name + "','" + result[0].std + "','" + result[0].division + "','" + roll + "','" + s1 + "','" + s2 + "','" + s3 + "','" + s4 + "','" + s5 + "','" + s6 + "','" + s7 + "','" + min + "','" + max + "','" + resu + "','" + sum + "')"
                              con.query(query, function (error1, result1, ind1) {
                                    if (error1) throw error1
                                    res.redirect('/staff/staffdashboard')
                              })
                        }
                  })
            }
      })
})

app.get('/staff/staffdashboard/viewresult', function (req, res) {
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "select * from result where std='" + data.class + "'and division='" + data.division + "'";
      con.query(query, function (error, result, ind) {
            if (error) throw error
            res.render('viewresult', { result })
      })
})

app.get('/staff/staffdashboard/viewresult/:id', function (req, res) {
      let id = req.params.id;
      let query = "select * from result where id=" + id;
      con.query(query, function (error, result, ind) {
            if (error) throw error
            res.render('updateresult', { result })
      })
})

app.post('/staff/staffdashboard/viewresult/:id', function (req, res) {
      let id = req.params.id;
      let name = req.body.name;
      let std = req.body.std;
      let div = req.body.div;
      let roll = req.body.roll;
      let s1 = req.body.s1;
      let s2 = req.body.s2;
      let s3 = req.body.s3;
      let s4 = req.body.s4;
      let s5 = req.body.s5;
      let s6 = req.body.s6;
      let s7 = req.body.s7;
      let sum = Number(s1) + Number(s2) + Number(s3) + Number(s4) + Number(s5) + Number(s6) + Number(s7);
      let min = Math.min(Number(s1), Number(s2), Number(s3), Number(s4), Number(s5), Number(s6), Number(s7));
      let max = Math.max(Number(s1), Number(s2), Number(s3), Number(s4), Number(s5), Number(s6), Number(s7));
      let arr = new Array(Number(s1), Number(s2), Number(s3), Number(s4), Number(s5), Number(s6), Number(s7));
      let temp = arr.filter((values, index, Array) => {
            return values > 33
      })
      let resu = 'FAILL';
      if (temp.length == 7) {
            resu = "PASS"
      } else if (temp.length >= 5) {
            resu = 'ATKT'
      }
      let query = "update result set name='" + name + "',std='" + std + "',division='" + div + "',rollno='" + roll + "',s1='" + s1 + "',s2='" + s2 + "',s3='" + s3 + "',s4='" + s4 + "',s5='" + s5 + "',s6='" + s6 + "',s7='" + s7 + "',minimum='" + min + "',maximum='" + max + "',resu='" + resu + "',total='" + sum + "'  where id=" + id;
      con.query(query, function (error, result, ind) {
            if (error) throw error
            res.redirect('/staff/staffdashboard/viewresult')
      })
})

app.get('/admin', function (req, res) {
      res.render('adminlogin')
})

app.post('/admin', function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      if (email == "darshan@gmail.com" && password == "darshan123") {
            res.redirect('/admin/admindashboard')
      } else {
            res.redirect('/admin')
      }
})

app.get('/admin/admindashboard', function (req, res) {
      res.render('admindashboard')
})

app.get('/admin/admindashboard/addstaff', function (req, res) {
      let result1 = [];
      let query = 'select * from standerd';
      con.query(query, function (error, results, fields) {
            if (error) throw error;
            result1 = results;
      })
      res.render('addstaff', { result1 })
})

app.post('/admin/admindashboard/addstaff', function (req, res) {
      let name = req.body.name;
      let email = req.body.email;
      let password = req.body.password;
      let std = req.body.std;
      let div = req.body.div;
      let query = "insert into staff (name,email,password,class,division) values ('" + name + "','" + email + "','" + password + "','" + std + "','" + div + "')";
      con.query(query, function (error, result, ind) {
            if (error) throw error
            console.log(result);
      })
      res.render('addstaff')
})

app.get('/admin/admindashboard/addstd', function (req, res) {
      let message = ''
      res.render('addstd', { message })
})

app.post('/admin/admindashboard/addstd', function (req, res) {
      let std = req.body.std;
      let message = ""
      let query = "select * from standerd where std=" + std;
      con.query(query, function (error, results, index) {
            if (results.length > 0) {
                  message = "Enter valid data " + std + "is not available";
                  console.log(results);
                  res.render('addstd', { message })
            } else {
                  query = "insert into standerd (std) values ('" + std + "')";
                  con.query(query, function (error1, results1, index1) {
                        console.log("result " + results1 + " error " + error1);
                        res.redirect('/admin/admindashboard')
                  })
            }
      })
})

app.get('/admin/admindashboard/adddivision', function (req, res) {
      let message = '';
      let result1 = []
      let query = 'select std from standerd';
      con.query(query, function (error, results, fields) {
            if (error) throw error;
            for (const iterator of results) {
                  // console.log(iterator.std);
                  result1.push(iterator.std);
            }
            console.log(result1.sort());
            res.render('adddivision', { result1, message })
      })
})

app.post('/admin/admindashboard/adddivision', function (req, res) {
      let std = req.body.std;
      let div = req.body.div;
      let message = ""
      let result1 = []
      let query = "select * from division where std= '" + std + "'and division='" + div + "'";
      con.query(query, function (error, results, index) {
            if (error) throw error
            if (results.length > 0) {
                  message = "Enter valid data " + std + "and " + div + " is not available";
                  query = 'select std from standerd';
                  con.query(query, function (error1, results2, fields) {
                        if (error) throw error;
                        for (const iterator of results2) {
                              result1.push(iterator.std);
                        }
                        console.log(result1.sort());
                        res.render('adddivision', { result1, message })
                  })
                  console.log(results);
                  res.render('addstd', { message })
            } else {
                  query = "insert into division (std,division) values ('" + std + "','" + div + "')";
                  con.query(query, function (error1, results1, index1) {
                        console.log("result " + results1 + " error " + error1);
                        res.redirect('/admin/admindashboard')
                  })
            }
      })
})

app.get('/admin/admindashboard/addstudent', function (req, res) {
      let message = '';
      let result1 = [];
      let query = 'select std from standerd';
      con.query(query, function (error, results, fields) {
            if (error) throw error;
            for (const iterator of results) {
                  result1.push(iterator.std);
            }
            result1.sort();
            res.render('addstudent', { result1, message })
      })
})

app.post('/admin/admindashboard/addstudent', function (req, res) {
      let name = req.body.name;
      let std = req.body.std;
      let div = req.body.div;
      let roll = req.body.roll;
      let message = '';
      let result1 = []
      let query = "select * from student where rollno='" + roll + "'and division='" + div + "'and std='" + std + "'";
      con.query(query, function (error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                  message = 'Roll No are ashine'
                  let q = 'select std from standerd';
                  con.query(q, function (error1, results, fields) {
                        if (error1) throw error;
                        for (const iterator of results) {
                              result1.push(iterator.std);
                        }
                        result1.sort();
                        res.render('addstudent', { result1, message })
                  })
            }
            else {
                  let q1 = "insert into student (name,std,division,rollno) values ('" + name + "','" + std + "','" + div + "','" + roll + "')"
                  con.query(q1, function (error2, results1, fields) {
                        if (error2) throw error2;
                        res.redirect('/admin/admindashboard');
                  })
            }
      })
})

app.get('/admin/admindashboard/viewstudent', function (req, res) {
      let query = 'select * from student';
      con.query(query, function (error, result, fields) {
            if (error) throw error;
            res.render('viewstudent', { result })
      })
})

app.get('/admin/admindashboard/viewstudentsorted', function (req, res) {
      let query = 'select * from student';
      let result = [];
      con.query(query, function (error, resul, fields) {
            if (error) throw error;
            result = resul.sort((a, b) => {
                  if (a.std !== b.std) {
                        return a.std.localeCompare(b.std);
                  } else {
                        return a.division.localeCompare(b.division);
                  }
            });
            res.render('viewstudent', { result })
      })
})

app.get('/admin/admindashboard/viewstaff', function (req, res) {
      let query = 'select * from staff';
      con.query(query, function (error, result, fields) {
            if (error) throw error;
            res.render('viewstaff', { result })
      })
})

app.get('/admin/admindashboard/viewstaff/:id', function (req, res) {
      let id = req.params.id;
      let result1 = [];
      let query = 'select * from staff where id=' + id;
      con.query(query, function (error, result, fields) {
            if (error) throw error;
            let q = 'select std from standerd';
            con.query(q, function (error1, results, fields) {
                  if (error1) throw error;
                  for (const iterator of results) {
                        result1.push(iterator.std);
                  }
                  result1.sort();
                  res.render('updatestaff', { result1, result })
            })
      })
})

app.get('/admin/admindashboard/viewresult', function (req, res) {
      let query = "select * from result";
      con.query(query, function (error, result, ind) {
            if (error) throw error;
            if (result.length >= 0) {
                  res.render('viewresultadmin', { result })
            } else if (result.length == 0) {
                  res.send("Studentd Result Are Not Available");
            }
      })
})

app.get('/admin/admindashboard/viewresultsorted', function (req, res) {
      let query = "select * from result";
      con.query(query, function (error, resul, ind) {
            if (error) throw error;
            let result = resul.sort((a, b) => {
                  if (a.std !== b.std) {
                        return a.std.localeCompare(b.std);
                  } else {
                        return a.division.localeCompare(b.division);
                  }
            });
            if (result.length >= 0) {
                  res.render('viewresultadmin', { result })
            } else if (result.length == 0) {
                  res.send("Studentd Result Are Not Available");
            }
      })
})

app.get('/admin/admindashboard/viewresultsorteddiv', function (req, res) {
      let query = "select * from result";
      con.query(query, function (error, resul, ind) {
            if (error) throw error;
            let result = resul.sort((b, a) => {
                  if (a.std !== b.std) {
                        return a.std.localeCompare(b.std);
                  } else {
                        return a.total.localeCompare(b.total);
                  }
            });
            result = result.sort((a, b) => {
                  if (a.std !== b.std) {
                        return a.std.localeCompare(b.std);
                  }
            });
            if (result.length >= 0) {
                  res.render('viewresultadmin', { result })
            } else if (result.length == 0) {
                  res.send("Studentd Result Are Not Available");
            }
      })
})

app.post('/admin/admindashboard/viewstaff/:id', function (req, res) {
      let id = req.params.id;
      let name = req.body.name;
      let email = req.body.email;
      let password = req.body.password;
      let std = req.body.std;
      let div = req.body.div;
      let result1 = [];
      let query = "update staff set name='" + name + "',email='" + email + "',password='" + password + "',class='" + std + "',division='" + div + "' where id=" + id;
      con.query(query, function (error, result, fields) {
            if (error) throw error;
            res.redirect('/admin/admindashboard/viewstaff')
      })
})

app.get('/getdivision/:std', function (req, res) {
      let std = req.params.std;
      let query = 'select division from division where std=' + std;
      let result1 = [];
      con.query(query, function (error, results, ind) {
            for (const iterator of results) {
                  result1.push(iterator.division);
            }
            res.send(result1);
      })
})

app.listen(3000)