const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const jobsRoutes = require('./routes/jobs');

//body parser needs to be used before teamRoutes
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/jobs', jobsRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  return next(err); // pass the error to the next piece of middleware
});

/*
  error handler - for a handler with four parameters,
  the first is assumed to be an error passed by another
  handler's "next"
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    message: err.message,
    /*
     if we're in development mode, include stack trace (full error object)
     otherwise, it's an empty object so the user doesn't see all of that
    */
    error: app.get('env') === 'development' ? err : {}
  });
});

app.listen(3000, function() {
  console.log('server started');
});
