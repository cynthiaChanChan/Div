function getRequest(requestUrl, dataObject, callback) {
  wx.request({
        url: requestUrl,
        data: dataObject,
        dataType: "json",
        header: {
        'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(response) {
             callback(response)
        }
    });
}

function formatDate(time) {
    var arr = time.split(/[-T:\/\s]/);
    var date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
    return date;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  getRequest,
  formatDate,
  formatNumber
}
