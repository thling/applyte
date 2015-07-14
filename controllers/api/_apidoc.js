// ------------------------
// Current Configurations
// ------------------------

/**
 * @apiDefine currentVersion
 * @apiVersion 0.2.1
 */

/**
 * @apiDefine successPaginationHeader
 * @apiSuccess  (Responose Header)  {String}    Link
 *      Links for previous page (<code>prev</code>), this page
 *      (<code>self</code>), and next page (<code>next</code>).
 *      Previous and next page maybe missing if nothing before or after this page.
 */

/**
 * @apiDefine errors
 * @apiError    (400)   {String} error      Error message
 * @apiError    (500)   {String} error      Error message (if applicable)
 */

// ----------------------
// Model Configurations
// ----------------------

// School
/**
 * @apiDefine successSchool
 * @apiSuccess  (200)   {String}    id          ID of the school
 * @apiSuccess  (200)   {String}    name        Name of the object
 * @apiSuccess  (200)   {String}    campus      Campus of the school
 * @apiSuccess  (200)   {String}    desc        Description of the school
 * @apiSuccess  (200)   {String}    email       Email address
 * @apiSuccess  (200)   {String}    phone       Phone of the school
 * @apiSuccess  (200)   {String}    logo        The file path to the school's logo
 * @apiSuccess  (200)   {Object}    address     The mailing address of the school
 * @apiSuccess  (200)   {String}    address.address1    Address 1
 * @apiSuccess  (200)   {String}    address.address2    Address 2
 * @apiSuccess  (200)   {String}    address.city        City
 * @apiSuccess  (200)   {String}    address.state       State or province
 * @apiSuccess  (200)   {String}    address.postalCode  Postal code
 * @apiSuccess  (200)   {String}    address.country     Country
 * @apiSuccess  (200)   {Object[]}  links       Related links ofr this school
 * @apiSuccess  (200)   {String}    links.name      Name of the link
 * @apiSuccess  (200)   {String}    links.url       URL of the link
 */

/**
 * @apiDefine successSchoolArray
 * @apiSuccess  (200)   {Object[]}  School          An array of area categories
 * @apiSuccess  (200)   {String}    School.id       ID of the school
 * @apiSuccess  (200)   {String}    School.name     Name of the object
 * @apiSuccess  (200)   {String}    School.campus   Campus of the school
 * @apiSuccess  (200)   {String}    School.desc     Description of the school
 * @apiSuccess  (200)   {String}    School.email    Email address
 * @apiSuccess  (200)   {String}    School.phone    Phone of the school
 * @apiSuccess  (200)   {String}    School.logo     The file path to the school's logo
 * @apiSuccess  (200)   {Object}    School.address  The mailing address of the school
 * @apiSuccess  (200)   {String}    School.address.address1     Address 1
 * @apiSuccess  (200)   {String}    School.address.address2     Address 2
 * @apiSuccess  (200)   {String}    School.address.city         City
 * @apiSuccess  (200)   {String}    School.address.state        State or province
 * @apiSuccess  (200)   {String}    School.address.postalCode   Postal code
 * @apiSuccess  (200)   {String}    School.address.country      Country
 * @apiSuccess  (200)   {Object[]}  School.links    Related links ofr this school
 * @apiSuccess  (200)   {String}    School.links.name   Name of the link
 * @apiSuccess  (200)   {String}    School.links.url    URL of the link
 */

/**
 * @apiDefine   successSchoolExampleHeaders
 * @apiSuccessExample   {json}  Response Example
 *      <!-- Response example for second request example.
 *           Note that although there are 3 lines here, the actual Link header
 *           will contain only one line, with spaces replacing the \n characer -->
 *      HTTP/1.1 200 OK
 *      Link: <https://applyte.io/api/schools?start=30&length=3>; rel="prev",
 *            <https://applyte.io/api/schools?start=33&length=3>; rel="self",
 *            <https://applyte.io/api/schools?start=36&length=3>; rel="next"
 *      [{
 *          "id": "random-school-identifier",
 *          "name": "Purdue University",
 *          "campus": "West Lafayette",
 *          "desc": "Better than IU in every aspect",
 *          "email": "test@email.com",
 *          "phone": "+1 (765) 494-4600",
 *          "logo": "",
 *          "address": {
 *              "address1": "610 Purdue Mall",
 *              "address2": "",
 *              "city": "West Lafayette",
 *              "state": "Indiana",
 *              "postalCode": "47907",
 *              "country": "United States of America"
 *          },
 *          "links": [{
 *                  "name": "Official Website",
 *                  "url": "http://www.purdue.edu"
 *          }]
 *      },
 *      {
 *          // School with the same format
 *      },
 *      {
 *          // School with the same format
 *      }]
 */

/**
 * @apiDefine paramSchool
 * @apiParam    {String}    name        Name of the object
 * @apiParam    {String}    [campus]    Campus of the school
 * @apiParam    {String}    [desc]      Description of the school
 * @apiParam    {String}    [email]     Email address
 * @apiParam    {String}    [phone]     Phone of the school
 * @apiParam    {String}    [logo]      The file path to the school's logo
 * @apiParam    {Object}    [address]   The mailing address of the school
 * @apiParam    {String}    [address.address1]      Address 1
 * @apiParam    {String}    [address.address2]      Address 2
 * @apiParam    {String}    [address.city]          City
 * @apiParam    {String}    [address.state]         State or province
 * @apiParam    {String}    [address.postalCode]    Postal code
 * @apiParam    {String}    [address.country]       Country
 * @apiParam    {Object[]}  [links]     Related links ofr this school
 * @apiParam    {String}    [links.name]    Name of the link
 * @apiParam    {String}    [links.url]     URL of the link
 */

/**
 * @apiDefine paramSchoolOptional
 * @apiParam    {String} [name]     Name of the object
 * @apiParam    {String} [campus]   Campus of the school
 * @apiParam    {String} [desc]     Description of the school
 * @apiParam    {String} [email]    Email address
 * @apiParam    {String} [phone]    Phone of the school
 * @apiParam    {String} [logo]     The file path to the school's logo
 * @apiParam    {Object} [address]  The mailing address of the school
 * @apiParam    {String} [address.address1]     Address 1
 * @apiParam    {String} [address.address2]     Address 2
 * @apiParam    {String} [address.city]         City
 * @apiParam    {String} [address.state]        State or province
 * @apiParam    {String} [address.postalCode]   Postal code
 * @apiParam    {String} [address.country]      Country
 * @apiParam    {Object[]} [links]      Related links ofr this school
 * @apiParam    {String} [links.name]   Name of the link
 * @apiParam    {String} [links.url]    URL of the link
 */

// Program
/**
 * @apiDefine successProgram
 * @apiSuccess  (200)   {String}    id          ID of the object
 * @apiSuccess  (200)   {String}    name        Name of the program
 * @apiSuccess  (200)   {String}    degree      Degree of the program
 * @apiSuccess  (200)   {String}    level       Level of the program
 * @apiSuccess  (200)   {String}    desc        Description of the object
 * @apiSuccess  (200)   {String}    schoolId    The ID of the school this program belongs to
 * @apiSuccess  (200)   {String}    department  Name of the department
 * @apiSuccess  (200)   {String}    faculty     Name of the faculty
 * @apiSuccess  (200)   {Object[]}  areas       Name of the object
 * @apiSuccess  (200)   {String}    areas.name          Name of the area
 * @apiSuccess  (200)   {String[]}  areas.categories    List of area categories's name
 * @apiSuccess  (200)   {Object}    contact     Contact of the program
 * @apiSuccess  (200)   {String}    contact.fax         Fax number
 * @apiSuccess  (200)   {String}    contact.phone       Phone number
 * @apiSuccess  (200)   {String}    contact.email       Email address
 * @apiSuccess  (200)   {Object}    contact.address     Mailing address
 * @apiSuccess  (200)   {Object}    contact.address.address1    Address 1
 * @apiSuccess  (200)   {Object}    contact.address.address2    Address 2
 * @apiSuccess  (200)   {Object}    contact.address.city        City
 * @apiSuccess  (200)   {Object}    contact.address.state       State or Province
 * @apiSuccess  (200)   {Object}    contact.address.postalCode  Postal code
 * @apiSuccess  (200)   {Object}    contact.address.country     Country
 */

/**
 * @apiDefine successProgramArray
 * @apiSuccess  (200)   {Object[]}  Program                 An array of area categories
 * @apiSuccess  (200)   {String}    Programs.id             ID of the object
 * @apiSuccess  (200)   {String}    Programs.name           Name of the program
 * @apiSuccess  (200)   {String}    Programs.degree         Degree of the program
 * @apiSuccess  (200)   {String}    Programs.level          Level of the program
 * @apiSuccess  (200)   {String}    Programs.desc           Description of the object
 * @apiSuccess  (200)   {String}    Programs.schoolId       The ID of the school this program belongs to
 * @apiSuccess  (200)   {String}    Programs.department     Name of the department
 * @apiSuccess  (200)   {String}    Programs.faculty        Name of the faculty
 * @apiSuccess  (200)   {Object[]}  Programs.areas          Name of the object
 * @apiSuccess  (200)   {String}    Programs.areas.name         Name of the area
 * @apiSuccess  (200)   {String[]}  Programs.areas.categories   List of area categories's name
 * @apiSuccess  (200)   {Object}    Programs.contact        Contact of the program
 * @apiSuccess  (200)   {String}    Programs.contact.fax        Fax number
 * @apiSuccess  (200)   {String}    Programs.contact.phone      Phone number
 * @apiSuccess  (200)   {String}    Programs.contact.email      Email address
 * @apiSuccess  (200)   {Object}    Programs.contact.address    Mailing address
 * @apiSuccess  (200)   {String}    Programs.contact.address.address1   Address 1
 * @apiSuccess  (200)   {String}    Programs.contact.address.address2   Address 2
 * @apiSuccess  (200)   {String}    Programs.contact.address.city       City
 * @apiSuccess  (200)   {String}    Programs.contact.address.state      State or Province
 * @apiSuccess  (200)   {String}    Programs.contact.address.postalCode Postal code
 * @apiSuccess  (200)   {String}    Programs.contact.address.country    Country
 */

/**
 * @apiDefine   successProgramExampleHeaders
 * @apiSuccessExample   {json}  Response Example
 *      <!-- Response example for second request example.
 *           Note that although there are 3 lines here, the actual Link header
 *           will contain only one line, with spaces replacing the \n characer -->
 *      HTTP/1.1 200 OK
 *      Link: <https://applyte.io/api/programs?start=30&length=3>; rel="prev",
 *            <https://applyte.io/api/programs?start=33&length=3>; rel="self",
 *            <https://applyte.io/api/programs?start=36&length=3>; rel="next"
 *      [{
 *          "id": "random-program-identifier",
 *          "name": "Computer Science",
 *          "degree": "Master of Science",
 *          "level": "Graduate",
 *          "desc": "The Department of Computer Sciences is good.",
 *          "schoolId": "random-school-identifier",
 *          "department": "Department of Computer Science",
 *          "faculty": "College of Science",
 *          "areas": [{
 *                  "name": "Information Security and Assurance",
 *                  "categories": ["Security"]
 *          }],
 *          "contact": {
 *              "fax": "+1 (765) 494-0739",
 *              "phone": "+1 (765) 494-6010",
 *              "email": "grad-info@cs.purdue.edu",
 *              "address": {
 *                  "address1": "610 Purdue Mall",
 *                  "address2": "",
 *                  "city": "West Lafayette",
 *                  "state": "Indiana",
 *                  "postalCode": "47907",
 *                  "country": "United States of America"
 *              }
 *          }
 *      },
 *      {
 *          // Program with the same format
 *      },
 *      {
 *          // Program with the same format
 *      }]
 */

/**
 * @apiDefine paramProgram
 * @apiParam    {String}    name        Name of the program
 * @apiParam    {String}    degree      Degree of the program
 * @apiParam    {String}    level       Level of the program
 * @apiParam    {String}    desc        Description of the object
 * @apiParam    {String}    [schoolId]  The ID of the school this program belongs to
 * @apiParam    {String}    department  Name of the department
 * @apiParam    {String}    faculty     Name of the faculty
 * @apiParam    {Object[]}  [areas]     Name of the object
 * @apiParam    {String}    [areas.name]        Name of the area
 * @apiParam    {String[]}  [areas.categories]  List of area categories's name
 * @apiParam    {Object}    [contact]   Contact of the program
 * @apiParam    {String}    [contact.fax]       Fax number
 * @apiParam    {String}    [contact.phone]     Phone number
 * @apiParam    {String}    [contact.email]     Email address
 * @apiParam    {Object}    [contact.address]   Mailing address
 * @apiParam    {String}    [contact.address.address1]      Address 1
 * @apiParam    {String}    [contact.address.address2]      Address 2
 * @apiParam    {String}    [contact.address.city]          City
 * @apiParam    {String}    [contact.address.state]         State or Province
 * @apiParam    {String}    [contact.address.postalCode]    Postal code
 * @apiParam    {String}    [contact.address.country]       Country
 */

/**
 * @apiDefine paramProgramOptional
 * @apiParam    {String}    [name]          Name of the program
 * @apiParam    {String}    [degree]        Degree of the program
 * @apiParam    {String}    [level]         Level of the program
 * @apiParam    {String}    [desc]          Description of the object
 * @apiParam    {String}    [schoolId]      The ID of the school this program belongs to
 * @apiParam    {String}    [department]    Name of the department
 * @apiParam    {String}    [faculty]       Name of the faculty
 * @apiParam    {Object[]}  [areas]         Name of the object
 * @apiParam    {String}    [areas.name]        Name of the area
 * @apiParam    {String[]}  [areas.categories]  List of area categories's name
 * @apiParam    {Object}    [contact]       Contact of the program
 * @apiParam    {String}    [contact.fax]       Fax number
 * @apiParam    {String}    [contact.phone]     Phone number
 * @apiParam    {String}    [contact.email]     Email address
 * @apiParam    {Object}    [contact.address]   Mailing address
 * @apiParam    {Object}    [contact.address.address1]      Address 1
 * @apiParam    {Object}    [contact.address.address2]      Address 2
 * @apiParam    {Object}    [contact.address.city]          City
 * @apiParam    {Object}    [contact.address.state]         State or Province
 * @apiParam    {Object}    [contact.address.postalCode]    Postal code
 * @apiParam    {Object}    [contact.address.country]       Country
 */

// AreaCategory

/**
 * @apiDefine successAreaCategory
 * @apiSuccess  (200)   {String}    id      ID of the object
 * @apiSuccess  (200)   {String}    name    Name of the object
 * @apiSuccess  (200)   {String}    desc    Description of the object
 */

/**
 * @apiDefine successAreaCategoryArray
 * @apiSuccess  (200)   {Object[]}  AreaCategories          List of area categories
 * @apiSuccess  (200)   {String}    AreaCategories.id       ID of the object
 * @apiSuccess  (200)   {String}    AreaCategories.name     Name of the object
 * @apiSuccess  (200)   {String}    AreaCategories.desc     Description of the object
 */

/**
 * @apiDefine   successAreaCategoryExampleHeaders
 * @apiSuccessExample   {json}  Response Example
 *      <!-- Response example for second request example.
 *           Note that although there are 3 lines here, the actual Link header
 *           will contain only one line, with spaces replacing the \n characer -->
 *      HTTP/1.1 200 OK
 *      Link: <https://applyte.io/api/area-categories?start=30&length=3>; rel="prev",
 *            <https://applyte.io/api/area-categories?start=33&length=3>; rel="self",
 *            <https://applyte.io/api/area-categories?start=36&length=3>; rel="next"
 *      [{
 *          "id": "random-area-category-identifier",
 *          "name": "Security",
 *          "desc": "Research of security",
 *      },
 *      {
 *          // Program with the same format
 *      },
 *      {
 *          // Program with the same format
 *      }]
 */

/**
 * @apiDefine paramAreaCategory
 * @apiParam    {String}    name        Name of the object
 * @apiParam    {String}    [desc]      Description of the object
 */

/**
 * @apiDefine paramAreaCategoryOptional
 * @apiParam    {String}    [name]      Name of the object
 * @apiParam    {String}    [desc]      Description of the object
 */

// User

/**
 * @apiDefine successUser
 * @apiSuccess  (200)   {String}    id      ID of the object
 * @apiSuccess  (200)   {Object}    name    Name specs of the user
 * @apiSuccess  (200)   {String}    name.first      The first name of this user
 * @apiSuccess  (200)   {String}    name.middle     The middle name of this user,
 *                                                  can be empty string
 * @apiSuccess  (200)   {String}    name.last       The last name of this user
 * @apiSuccess  (200)   {String}    name.preferred  The preferred name of this user,
 *                                                  default to first name
 * @apiSuccess  (200)   {Date}      birthday    The birthday of this user
 * @apiSuccess  (200)   {Object}    contact     Contact of the user
 * @apiSuccess  (200)   {String}    contact.phone       Phone number
 * @apiSuccess  (200)   {String}    contact.email       Email address
 * @apiSuccess  (200)   {Object}    contact.address     Mailing address
 * @apiSuccess  (200)   {String}    contact.address.address1    Address 1
 * @apiSuccess  (200)   {String}    contact.address.address2    Address 2
 * @apiSuccess  (200)   {String}    contact.address.city        City
 * @apiSuccess  (200)   {String}    contact.address.state       State or Province
 * @apiSuccess  (200)   {String}    contact.address.postalCode  Postal code
 * @apiSuccess  (200)   {String}    contact.address.country     Country
 */

/**
 * @apiDefine successUserArray
 * @apiSuccess  (200)   {Object[]}  Users   An array of users
 * @apiSuccess  (200)   {String}    Users.id    ID of the object
 * @apiSuccess  (200)   {Object}    Users.name  Name specs of the user
 * @apiSuccess  (200)   {String}    Users.name.first    The first name of this user
 * @apiSuccess  (200)   {String}    Users.name.middle   The middle name of this user,
 *                                                      can be empty string
 * @apiSuccess  (200)   {String}    Users.name.last         The last name of this user
 * @apiSuccess  (200)   {String}    Users.name.preferred    The preferred name of this user,
 *                                                          default to first name
 * @apiSuccess  (200)   {Date}      Users.birthday  The birthday of this user
 * @apiSuccess  (200)   {Object}    Users.contact   Contact of the user
 * @apiSuccess  (200)   {String}    Users.contact.phone     Phone number
 * @apiSuccess  (200)   {String}    Users.contact.email     Email address
 * @apiSuccess  (200)   {Object}    Users.contact.address   Mailing address
 * @apiSuccess  (200)   {String}    Users.contact.address.address1      Address 1
 * @apiSuccess  (200)   {String}    Users.contact.address.address2      Address 2
 * @apiSuccess  (200)   {String}    Users.contact.address.city          City
 * @apiSuccess  (200)   {String}    Users.contact.address.state         State or Province
 * @apiSuccess  (200)   {String}    Users.contact.address.postalCode    Postal code
 * @apiSuccess  (200)   {String}    Users.contact.address.country       Country
 */

/**
 * @apiDefine   successUserExampleHeaders
 * @apiSuccessExample   {json}  Response Example
 *      <!-- Response example for second request example.
 *           Note that although there are 3 lines here, the actual Link header
 *           will contain only one line, with spaces replacing the \n characer -->
 *      HTTP/1.1 200 OK
 *      Link: <https://applyte.io/api/users?start=30&length=3>; rel="prev",
 *            <https://applyte.io/api/users?start=33&length=3>; rel="self",
 *            <https://applyte.io/api/users?start=36&length=3>; rel="next"
 *      [{
 *          "id": "random-user-identifier",
 *          "name": {
 *              "first": "Purdue",
 *              "middle": "Boilermaker",
 *              "last": "Pete",
 *              "preferred": "Pete"
 *          },
 *          "birthday": "Wed May 01 1991 00:00:00 GMT-05:00",
 *          "contact": {
 *              "phone": "+ (123) 456-7890",
 *              "email": "pete@purdue.edu",
 *              "address": {
 *                  "address1": "610 Purdue Mall",
 *                  "address2": "",
 *                  "city": "West Lafayette",
 *                  "state": "Indiana",
 *                  "postalCode": "47907",
 *                  "country": "United States of America"
 *              }
 *          }
 *      },
 *      {
 *          // User with the same format
 *      },
 *      {
 *          // User with the same format
 *      }]
 */

/**
 * @apiDefine paramUser
 * @apiParam    {String}    newPassword     New password for the user
 * @apiParam    {Object}    name    Name specs of the user
 * @apiParam    {String}    name.first      The firstname of the user
 * @apiParam    {String}    [name.middle]   The middle name of the user.
 *                                          Default to <code>""</code> (empty string)
 *                                          if not supplied
 * @apiParam    {String}    name.last       The last name of the username
 * @apiParam    {String}    [name.preferred]    The preferred name of the user.
 *                                              Default to <code>name.first</code>
 *                                              if not supplied
 * @apiParam    {String}    [birthday]      The birthday of the user
 * @apiParam    {Object}    contact         The contacts of the user
 * @apiParam    {String}    contact.email       The email address of the user
 * @apiParam    {String}    [contact.phone]     The phone number of the user
 * @apiParam    {Object}    [contact.address]   The address of the user
 * @apiParam    {String}    contact.address.address1    Address 1
 * @apiParam    {String}    contact.address.address2    Address 2
 * @apiParam    {String}    contact.address.city        City
 * @apiParam    {String}    contact.address.state       State or Province
 * @apiParam    {String}    contact.address.postalCode  Zipcode or postal code
 * @apiParam    {String}    contact.address.country     Country name
 */

/**
 * @apiDefine paramUserOptional
 * @apiParam    {String}    [newPassword]   New password for the user
 * @apiParam    {Object}    [name]  Name specs of the user
 * @apiParam    {String}    [name.first]    The firstname of the user
 * @apiParam    {String}    [name.middle]   The middle name of the user
 *                                          Default to '' if not supplied
 * @apiParam    {String}    [name.last]     The last name of the username
 * @apiParam    {String}    [name.preferred]    The preferred name of the user.
 *                                              Default to firstname if not supplied
 * @apiParam    {String}    [birthday]      The birthday of the user
 * @apiParam    {Object}    [contact]       The contacts of the user
 * @apiParam    {String}    [contact.email]     The email address of the user
 * @apiParam    {String}    [contact.phone]     The phone number of the user
 * @apiParam    {Object}    [contact.address]   The address of the user
 * @apiParam    {String}    [contact.address.address1]      Address 1
 * @apiParam    {String}    [contact.address.address2]      Address 2
 * @apiParam    {String}    [contact.address.city]          City
 * @apiParam    {String}    [contact.address.state]         State or Province
 * @apiParam    {String}    [contact.address.postalCode]    Zipcode or postal code
 * @apiParam    {String}    [contact.address.country]         Country name
 */

// -----------
// Histories
// -----------

/**
 * @api {get}   /api/schools    Query with complex conditions
 * @apiName     query
 * @apiGroup    Schools
 * @apiVersion  0.0.1
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [name]      The name to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [campus]    The campus to search for. Require name
 *                                      if this is specified. Must be encoded
 *                                      with <code>encodeURI</code>
 *
 * @apiParam    {String}    [country]   The country to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [state]     The state/province to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [city]      The city to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 *
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=name} [sort=name]   The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th schools -->
 *      https://applyte.io/api/schools
 *
 *      <!-- Get 33rd to 35th schools -->
 *      https://applyte.io/api/schools?start=33&length=3
 *
 *      <!-- Get 2nd to 8th schools, sorting descendingly by name -->
 *      https://applyte.io/api/schools?start=2&length=7&sort=name&order=desc
 *
 *      <!-- Get fields [id, name, campus] of the schools that are located in Boston, MA, US,
 *              limit 1, start at 2, and sorted descendingly -->
 *      https://applyte.io/api/schools?fields=id||name||campus
 *              &country=United%20States%20of%20America&state=Massachusetts&city=Boston
 *              &limit=1&start=2&order=desc
 *
 * @apiUse  successSchoolArray
 * @apiUse  errors
 */

/**
 * @api {get}   /api/programs    Query with complex conditions
 * @apiName     query
 * @apiGroup    Programs
 * @apiVersion  0.0.1
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [name]      The name to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [degree]    The degree to search for. Require name
 *                                      if this is specified. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [level]     The level to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [department]    The department to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [faculty]   The faculty to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [areas]     The areas to search for. Check if the program
 *                                      contains one or more of the specified areas.
 *                                      Multiple areas can be separated by <code>||</code>,
 *                                      and then encoded with <code>encodeURI</code> entirely.
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 * @apiParam    {String=true,false} [school=false]
 *                                      Include the actual School data referenced to
 *                                      by the <code>schoolId</code> field.
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=name} [sort=name]   The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th programs -->
 *      https://applyte.io/api/programs
 *
 *      <!-- Get 33rd to 35th programs -->
 *      https://applyte.io/api/programs?start=33&length=3
 *
 *      <!-- Get 2nd to 8th programs, sorting descendingly by name -->
 *      https://applyte.io/api/programs?start=2&length=7&sort=name&order=desc
 *
 *      <!-- Get the 2nd program with 'Database' area that is Undergraduate
 *              level and whose faculty is School of Engineering, sorted desc,
 *              include the data of the school this program belongs to -->
 *      https://applyte.io/api/schools?start=2&fields=name||schoolId
 *              &areas=Databases&level=Undergraduate
 *              &faculty=School%20of%20Engineering&order=desc
 *              &school=true
 *
 * @apiUse  successProgramArray
 * @apiUse  errors
 */

/**
 * @api {get}   /api/area-categories    Query with complex conditions
 * @apiName     query
 * @apiGroup    AreaCategories
 * @apiVersion  0.0.1
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [name]      The name to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=name} [sort=name]   The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th area categories -->
 *      https://applyte.io/api/area-categories
 *
 *      <!-- Get 33rd to 35th area categories -->
 *      https://applyte.io/api/area-categories?start=33&length=3
 *
 *      <!-- Get 2nd to 8th area categories, sorting descendingly by name -->
 *      https://applyte.io/api/area-categories?start=2&length=7&sort=name&order=desc
 *
 *      <!-- Get field 'name' of area categories -->
 *      https://applyte.io/api/area-categories?fields=name
 *
 * @apiUse  successAreaCategoryArray
 * @apiUse  errors
 */
