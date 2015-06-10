// ------------------------
// Current Configurations
// ------------------------

/**
 * @apiDefine currentVersion
 * @apiVersion 0.0.1
 */

/**
 * @apiDefine errors
 * @apiError    (400)   {String} error      Error message
 * @apiError    (400)   {Object} reqParams  The parameters received
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
 * @apiSuccess  (200)   {Object}    Programs.contact.address.address1   Address 1
 * @apiSuccess  (200)   {Object}    Programs.contact.address.address2   Address 2
 * @apiSuccess  (200)   {Object}    Programs.contact.address.city       City
 * @apiSuccess  (200)   {Object}    Programs.contact.address.state      State or Province
 * @apiSuccess  (200)   {Object}    Programs.contact.address.postalCode Postal code
 * @apiSuccess  (200)   {Object}    Programs.contact.address.country    Country
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
 * @apiParam    {Object}    [contact.address.address1]      Address 1
 * @apiParam    {Object}    [contact.address.address2]      Address 2
 * @apiParam    {Object}    [contact.address.city]          City
 * @apiParam    {Object}    [contact.address.state]         State or Province
 * @apiParam    {Object}    [contact.address.postalCode]    Postal code
 * @apiParam    {Object}    [contact.address.country]       Country
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
 * @apiDefine paramAreaCategory
 * @apiParam    {String}    name        Name of the object
 * @apiParam    {String}    [desc]      Description of the object
 */

/**
 * @apiDefine paramAreaCategoryOptional
 * @apiParam    {String}    [name]      Name of the object
 * @apiParam    {String}    [desc]      Description of the object
 */



// -----------
// Histories
// -----------
