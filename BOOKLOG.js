var num13 = '';
var toDay = '';
var pageNo = 1;
const pageCnt = 12;
function func_Init() {
  setList();
}
function setList() {
  var cn = new ActiveXObject('ADODB.Connection');
  var rs = new ActiveXObject('ADODB.Recordset');
  var mySql = "SELECT isbn13,bookname,coverimg FROM booklog ORDER BY getdate DESC";
  cn.Open(' Provider=MSDASQL; Data Source=BOOKLOG_MYSQL');
  try {
    rs.Open(mySql, cn);
  } catch (e) {
    cn.Close();
    alert('対象テーブル検索不能' + (e.number & 0xFFFF) + ' ' + e.message + ' ' + mySql);
    return;
  }
  if (toDay == '') {
    var date = new Date();
    toDay = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2);
  }
  if (rs.EOF){
    rs.Close();
    cn.Close();
    rs = null;
    cn = null;
    clrScr();
    $('#tabs').tabs( { active: 1} );
    return;
  }
  var strYMD = '';
  var strDoc = '';
  var itemNo = 0;
  var colNo = 0;
  while (!rs.EOF){
    itemNo += 1;
    if ((itemNo > (pageNo - 1) * pageCnt) && itemNo < (pageNo * pageCnt) + 1){
      colNo += 1;
      if (colNo == 1){ strDoc  += '<tr>'; }
      strDoc  += '<td><a href="#" onClick=updPage("'
              + rs(0).value + '")><img src="https://images-na.ssl-images-amazon.com/images/I/'
              + rs(2).value.substr(0,13) + 'AC_UL320_SR256,320_.jpg" width="170" '
              + ' title="' + rs(1).value + '"></a></td>';
      if (colNo == 6){
        strDoc  += '</tr>';
        colNo = 0;
      }
    }
    rs.MoveNext();
  }
  $('#lst01').replaceWith('<tbody id="lst01">' + strDoc + '</tbody>');
  rs.Close();
  cn.Close();
  rs = null;
  cn = null;
  strDoc = '';
  if (pageNo > 1){ strDoc = '<a href="#" onclick="befPage();">≪前の' + pageCnt + '件へ</a>'; }
  if (pageNo * pageCnt < itemNo){ strDoc += '　<a href="#" onclick="nextPage();">次の' + pageCnt + '件へ≫</a>'; }  
  if (strDoc != ''){ $('#footer').replaceWith('<div id="footer">' + strDoc + '</div>'); }  
  clrScr();
  $('#tabs').tabs( { active: 0} );
}
function nextPage() {
  pageNo = pageNo + 1;
  setList();
}
function befPage() {
  pageNo = pageNo - 1;
  setList();
}
function updPage(uIsbn) {
  num13 = uIsbn;
  var cn = new ActiveXObject('ADODB.Connection');
  var rs = new ActiveXObject('ADODB.Recordset');
  var mySql = "SELECT DATE_FORMAT(getdate,'%Y/%m/%d'),"
            + "DATE_FORMAT(issuedate,'%Y/%m/%d'),"
            + "DATE_FORMAT(readdate,'%Y/%m/%d'),"
            + "isbn13,isbn10,bookname,author,publisher,genre,ownership,"
            + "purchase,library,overview,impressions,state,coverimg"
            + " FROM booklog WHERE isbn13 = '" + num13 + "'";
  cn.Open(' Provider=MSDASQL; Data Source=BOOKLOG_MYSQL');
  try {
    rs.Open(mySql, cn);
  } catch (e) {
    cn.Close();
    document.write('対象レコード検索不能' + (e.number & 0xFFFF) + ' ' + e.message + ' ' + mySql);
    alert('対象レコード検索不能');
    return;
  }
  num13 = rs(3).value;
  if (!rs.EOF){
    $('#inIsbn13').val(num13);
    $('#inGetdate').val(rs(0).value);
    $('#inIssuedate').val(rs(1).value);
    $('#inReaddate').val(rs(2).value);
    $('#inIsbn10').val(rs(4).value);
    if (rs(4).value != null) {
      $('#acIsbn10').replaceWith('<div id="acIsbn10"><a href="https://www.amazon.co.jp/dp/' + rs(4).value + '" target="_blank">ISBN10：</a></div>');
    } else {
      $('#acIsbn10').replaceWith('<div id="acIsbn10"><a href="https://www.amazon.co.jp/dp/" target="_blank">ISBN10：</a></div>');
    }
    $('#inBookname').val(rs(5).value);
    $('#inAuthor').val(rs(6).value);
    $('#inPublisher').val(rs(7).value);
    $('#inGenre').val(rs(8).value);
    if (rs(9).value == 0) {
      $('input[name=inOwnership]:eq(1)').prop('checked', true);
    } else {
      $('input[name=inOwnership]:eq(0)').prop('checked', true);
    }
    $('#inPurchase').val(rs(10).value);
    $('#inLibrary').val(rs(11).value);
    $('#inOverview').val(rs(12).value);
    $('#inImpressions').val(rs(13).value);
    $('#inState').val(rs(14).value);
    $('#inCoverimg').val(rs(15).value);
    if (rs(15).value != null) {
      $('#scrImage').replaceWith('<div id="scrImage"><img src="https://images-na.ssl-images-amazon.com/images/I/' + rs(15).value + '" align="center" width="275"></div>');
    } else {
      $('#scrImage').replaceWith('<div id="scrImage">表紙イメージなし</div>');
    }
  }
  $('#lbl02').replaceWith('<div id="lbl02">詳細</div>');
  rs.Close();
  cn.Close();
  rs = null;
  cn = null;
  $('#insert').hide();
  $('#update').show();
  $('#delete').show();
  $('#clear').show();
  $('#inIsbn13').prop('disabled', true);
  $('#tabs').tabs( { active: 1} );
}
function updRec() {
  if (num13 == '') { alert('ISBNコードが、セットされていません！'); return; }
  if ( !inpCheck() ) { return; }
  var cn = new ActiveXObject('ADODB.Connection');
  var rs = new ActiveXObject('ADODB.Recordset');
  cn.Open(' Provider=MSDASQL; Data Source=BOOKLOG_MYSQL');
  var mySql = "UPDATE booklog SET ";
  mySql +=  "isbn10 = "      + getVal('inIsbn10');
  mySql += ",bookname = "    + getVal('inBookname');
  mySql += ",author = "      + getVal('inAuthor');
  mySql += ",publisher = "   + getVal('inPublisher');
  mySql += ",genre = "       + getVal('inGenre');
  mySql += ",issuedate = "   + getVal('inIssuedate');
  mySql += ",getdate = "     + getVal('inGetdate');
  mySql += ",readdate = "    + getVal('inReaddate');
  if ($('input[name=inOwnership]:eq(0)').prop('checked')) {
    mySql += ",ownership = 1";
  } else {
    mySql += ",ownership = 0";
  }
  mySql += ",purchase = "    + getVal('inPurchase');
  mySql += ",library = "     + getVal('inLibrary');
  mySql += ",overview = "    + getVal('inOverview');
  mySql += ",impressions = " + getVal('inImpressions');
  mySql += ",state = "       + getVal('inState');
  mySql += ",coverimg = "    + getVal('inCoverimg');
  mySql += " WHERE isbn13 = '" + num13 + "'";
  try {
    var rs = cn.Execute(mySql);
    alert('対象レコード更新完了');
  } catch (e) {
    cn.Close();
    alert('対象レコード更新失敗 ' + (e.number & 0xFFFF) + ' ' + e.message + ' ' + mySql);
    return;
  }
  cn.Close();
  rs = null;
  cn = null;
  setList();
}
function insRec() {
  num13 = $('#inIsbn13').val(); 
  if ( !inpCheck() ) { return; }
  var cn = new ActiveXObject('ADODB.Connection');
  var rs = new ActiveXObject('ADODB.Recordset');
  cn.Open(' Provider=MSDASQL; Data Source=BOOKLOG_MYSQL');
  var mySql  = "INSERT INTO booklog(isbn13,isbn10,bookname,author,publisher,genre,";
  mySql += "issuedate,getdate,readdate,ownership,purchase,library,overview,impressions,state,coverimg)";
  mySql += " VALUES(";
  mySql += "'" + num13 + "'";
  mySql += "," + getVal('inIsbn10');
  mySql += "," + getVal('inBookname');
  mySql += "," + getVal('inAuthor');
  mySql += "," + getVal('inPublisher');
  mySql += "," + getVal('inGenre');
  mySql += "," + getVal('inIssuedate');
  mySql += "," + getVal('inGetdate');
  mySql += "," + getVal('inReaddate');
  if ($('input[name=inOwnership]:eq(0)').prop('checked')) {
    mySql += ",1";
  } else {
    mySql += ",0";
  }
  mySql += "," + getVal('inPurchase');
  mySql += "," + getVal('inLibrary');
  mySql += "," + getVal('inOverview');
  mySql += "," + getVal('inImpressions');
  mySql += "," + getVal('inState');
  mySql += "," + getVal('inCoverimg') + ")";
  try {
    var rs   = cn.Execute(mySql);
    alert('対象レコード登録完了');
  } catch (e) {
    cn.Close();
    if ((e.number & 0xFFFF) == '3604') {
      alert('対象レコードは、既に登録されています。');
      updPage(num13);
    } else {
      alert('対象レコード登録失敗 ' + (e.number & 0xFFFF) + ' ' + e.message + ' ' + mySql);
    }
    return;
  }
  cn.Close();
  rs = null;
  cn = null;
  clrScr();
  setList();
}
function clrScr() {
  $('#inIsbn13').val('9784000000000');
  $('#inIsbn10').val('4000000000');
  $('#inCoverimg').val('.jpg');
  $('#scrImage').replaceWith('<div id="scrImage"></div>');
  $('#inBookname').val('');
  $('#inAuthor').val('');
  $('#inGenre').val('');
  $('#inPublisher').val('');
  $('#inIssuedate').val(toDay);
  $('#inGetdate').val(toDay);
  $('#inReaddate').val(toDay);
  $('#inLibrary').val('');
  $('#inPurchase').val('0');
  $('#inOverview').val('');
  $('#inImpressions').val('');
  $('#insert').show();
  $('#update').hide();
  $('#delete').hide();
  $('#clear').hide();
  $('#inIsbn13').prop('disabled', false);
  $('#lbl02').replaceWith('<div id="lbl02">新規</div>');
}
function delRec() {
  if (num13 == '') { alert('ISBNコードがセットされていません！'); return; }
  var cn = new ActiveXObject('ADODB.Connection');
  if( confirm('本当に削除しますか？')) {
  } else {
    alert('削除キャンセルしました！');
    return;
  }
  var rs = new ActiveXObject('ADODB.Recordset');
  cn.Open(' Provider=MSDASQL; Data Source=BOOKLOG_MYSQL');
  var mySql = "DELETE FROM booklog WHERE isbn13 = '" + num13 + "'";
  try {
    var rs = cn.Execute(mySql);
    alert('対象レコード削除完了');
  } catch (e) {
    cn.Close();
    alert('対象レコード削除失敗 ' + (e.number & 0xFFFF) + ' ' + e.message + ' ' + mySql);
    return;
  }
  cn.Close();
  rs = null;
  cn = null;
  setList();
}
function toLocaleString( date ) {
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
        ].join( '/' );
}
function inpCheck () {
  if (num13 == '') { alert('ISBNコードは、必須入力項目です！');
   $('#inIsbn13').focus();
   $('#inIsbn13').style.backgroundColor = 'mistyrose';
   return;
  }
  $('#inIsbn13').css('backgroundColor','#FFFFFF');
  if (getVal('inBookname') == 'null') { alert('書名は、必須入力項目です！'); 
    $('#inBookname').focus();
    $('#inBookname').css('backgroundColor','mistyrose');
    return false;
  }
  $('#inBookname').css('backgroundColor','#FFFFFF');
  if ( !isDate($('#inIssuedate').val())) { alert('発行日の日付形式が正しくありません！ ' + getVal('inIssuedate'));
    $('#inIssuedate').focus();
    $('#inIssuedate').css('backgroundColor','mistyrose');
    return false;
  }
  $('#inIssuedate').css('backgroundColor','#FFFFFF');
  if (getVal('inGetdate') == 'null') { alert('入手日は、必須入力項目です！');
    $('#inGetdate').focus();
    $('#inGetdate').css('backgroundColor','mistyrose');
    return false;
  }
  if ( !isDate($('#inGetdate').val())) { alert('入手日の日付形式が正しくありません！ ' + getVal('inGetdate'));
    $('#inGetdate').focus();
    $('#inGetdate').css('backgroundColor','mistyrose');
    return false;
  }
  $('#inGetdate').css('backgroundColor','#FFFFFF');
  if ( !isDate($('#inReaddate').val())) { alert('読了日の日付形式が正しくありません！ ' + getVal('inReaddate'));
    $('#inReaddate').focus();
    $('#inReaddate').css('backgroundColor','mistyrose');
    return false;
  }
  $('#inReaddate').css('backgroundColor','#FFFFFF');
  if ( isNaN(getVal('inPurchase')) ) { alert('数値を入力してください！');
    $('#inPurchase').focus();
    $('#inPurchase').css('backgroundColor','mistyrose');
    return false;
  }
  $('#inPurchase').css('backgroundColor','#FFFFFF');
  return true;
}
function isDate ( strDate ) {
  if (strDate == '') return true;
  if(!strDate.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/)){
    return false;
  } 
  var date = new Date(strDate);  
  if(date.getFullYear() !=  strDate.split('/')[0] 
    || date.getMonth() != strDate.split('/')[1] - 1 
    || date.getDate() != strDate.split('/')[2]){
    return false;
  } else {
    return true;
  }
}
function getVal ( str ) {
  var tmp = $('#' + str).val();
  if (tmp == '') {
    return 'null';
  } else if ( str == 'inPurchase' || str == 'inState'){
    return + tmp;
  } else {
    return "'" + tmp + "'";
  }
}
function getImg () {
  isbn10 = $('#inIsbn10').val();
  if (isbn10 == '') { return; }
  if (isbn10 == '4000000000') { return; }
  $.ajax({
    url: 'https://www.amazon.co.jp/dp/' + isbn10,
    type: 'get'
  }).done(function (data, textStatus, jqXHR) {
      var str = data;
      var content = str.substr((str.indexOf(' data-a-dynamic-image=')+79),39);
      $('#inCoverimg').val(content);
      $('#scrImage').replaceWith('<div id="scrImage"><img src="https://images-na.ssl-images-amazon.com/images/I/' + content + '" align="center" width="275"></div>');
      if ($('#inIsbn13').val() == '9784000000000') {
        content = '978' + str.substr((str.indexOf('ISBN-13:</b> 978-')+17),10);
        $('#inIsbn13').val(content);
      }
      if ($('#inBookname').val() == '') {
        content = str.substr((str.indexOf(' id="productTitle" class="a-size-large">')+40),100);
        content = content.substr(0,content.indexOf('</span>'));
        if (content.length > 50) { content = content.substr(0,50).trim(); }
        $('#inBookname').val(content);
      }
      if ($('#inPublisher').val() == '') {
        content = str.substr((str.indexOf('<li><b>出版社:</b> ')+16),50);
        content = content.substr(0,content.indexOf('('));
        if (content.length > 25) { content = content.substr(0,25).trim(); }
        $('#inPublisher').val(content);
      }
      if ($('#inIssuedate').val() == toDay) {
        content = str.substr((str.indexOf('<li><b> 発売日：</b> ')+17),10);
        content = content.replace( '</', '' );
        content = content.replace( '<', '' );
        $('#inIssuedate').val(content);
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(errorThrown);
    })
}
