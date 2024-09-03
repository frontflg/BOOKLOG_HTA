var num13 = '';
var toDay = '';
var pageNo = 1;
const pageCnt = 12;
const tSchema = 'mysql_test.'; // 環境に合わせて変える
const tDatSrc ='Provider=MSDASQL; Data Source=Connector_MariaDB'; // 環境に合わせて変える

function setList() {
  var cn = new ActiveXObject('ADODB.Connection');
  var rs = new ActiveXObject('ADODB.Recordset');
  var mySql = "SELECT isbn13,bookname,substring(bookname,27) AS bookname2,"
            + " isbn10,author,substring(author,13) AS author2,"
            + " DATE_FORMAT(getdate,'%Y/%m/%d'),"
            + " CASE WHEN state = '了' THEN '2' WHEN state = '中' THEN '1'"
            + " ELSE '0' END AS state FROM " + tSchema
            + "app_booklog ORDER BY getdate DESC";

  cn.Open(tDatSrc);
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
  var strNam = '';
  var strAut = '';
  var strYMD = '';
  var strDoc = '';
  var strDoc2 = '';
  var itemNo = 0;
  var colNo = 0;
  while (!rs.EOF){
    itemNo += 1;
    strNam = rs(1).value.slice(0,26) + rs(2).value;
    strAut = rs(4).value.slice(0,12) + rs(5).value;
    strYMD = rs(6).value;
    if ((itemNo > (pageNo - 1) * pageCnt) && itemNo < (pageNo * pageCnt) + 1){
      colNo += 1;
      if (colNo == 1){ strDoc  += '<tr>'; }
      strDoc  += '<td><a href="#" onClick=updPage("'
              + rs(0).value + '")><img src="https://images-fe.ssl-images-amazon.com/images/P/'
              + rs(3).value.substr(0,10) + '.09.LZZZZZZZ" height="244" width="170" '
              + ' title="' + strNam + '"></a></td>';
      if (colNo == 6){
        strDoc  += '</tr>';
        colNo = 0;
      }
    }

    strDoc2  += '<tr><td width="150px">';
    strDoc2  += '<a href="#" onClick=updPage("' + rs(0).value + '")>' + rs(0).value + '</a></td>';
    if (strYMD < '1970/01/01') { strYMD = ""; }
    strDoc2 += '<td width="470px">' + strNam + '</td><td width="410px" style="word-break : break-all;">' + strAut + '</td>';
    strDoc2 += '<td width="110px">' + strYMD + '</td>';
    if (rs(7).value == '2') {
       strDoc2 += '<td>読　了</td></tr>';
    } else if (rs(7).value == '1') {
       strDoc2 += '<td>読書中</td></tr>';
    } else {
       strDoc2 += '<td>未　読</td></tr>';
    }

    rs.MoveNext();
  }
  $('#lst01').replaceWith('<tbody id="lst01">' + strDoc + '</tbody>');
  $('#lst02').replaceWith('<tbody id="lst02" style="overflow-y: scroll; height: 574px;">' + strDoc2 + '</tbody>');

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
  var strNam = '';
  var strAut = '';
  var mySql = "SELECT DATE_FORMAT(getdate,'%Y/%m/%d'),"
            + "DATE_FORMAT(issuedate,'%Y/%m/%d'),"
            + "DATE_FORMAT(readdate,'%Y/%m/%d'),"
            + "isbn13,isbn10,bookname,substring(bookname,27) AS bookname2,"
            + "author,substring(author,13) AS author2,"
            + "publisher,genre,ownership,"
            + "purchase,library,overview,impressions,"
            + " CASE WHEN state = '了' THEN '2' WHEN state = '中' THEN '1'"
            + " ELSE '0' END AS state,coverimg"
            + " FROM " + tSchema + "app_booklog WHERE isbn13 = '" + num13 + "'";
  cn.Open(tDatSrc);
  try {
    rs.Open(mySql, cn);
  } catch (e) {
    cn.Close();
    document.write('対象レコード検索不能' + (e.number & 0xFFFF) + ' ' + e.message + ' ' + mySql);
    alert('対象レコード検索不能');
    return;
  }
  if (!rs.EOF){
    num13 = rs(3).value;
    strNam = rs(5).value.slice(0,26) + rs(6).value;
    strAut = rs(7).value.slice(0,12) + rs(8).value;
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
    $('#inBookname').val(strNam);
    $('#inAuthor').val(strAut);
    $('#inPublisher').val(rs(9).value);
    $('#inGenre').val(rs(10).value);
    if (rs(11).value == 0) {
      $('input[name=inOwnership]:eq(1)').prop('checked', true);
    } else {
      $('input[name=inOwnership]:eq(0)').prop('checked', true);
    }
    $('#inPurchase').val(rs(12).value);
    $('#inLibrary').val(rs(13).value);
    $('#inOverview').val(rs(14).value);
    $('#inImpressions').val(rs(15).value);
    $('#inState').val(rs(16).value);
    $('#inCoverimg').val(rs(17).value);
    if (rs(4).value != null) {
      $('#scrImage').replaceWith('<div id="scrImage"><img src="https://images-fe.ssl-images-amazon.com/images/P/' + rs(4).value + '.09.LZZZZZZZ" align="center" width="275"></div>');
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
  $('#tabs').tabs( { active: 2} );
}
function updRec() {
  if (num13 == '') { alert('ISBNコードが、セットされていません！'); return; }
  if ( !inpCheck() ) { return; }
  var cn = new ActiveXObject('ADODB.Connection');
  var rs = new ActiveXObject('ADODB.Recordset');
  cn.Open(tDatSrc);
  var mySql = "UPDATE " + tSchema + "app_booklog SET ";
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
  if (getVal('inState') == '2') {
    mySql += ",state = '了'";
  } else if (getVal('inState') == '1') {
    mySql += ",state = '中'";
  } else {
    mySql += ",state = '未'";
  }
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
  cn.Open(tDatSrc);
  var mySql  = "INSERT INTO " + tSchema + "app_booklog(isbn13,isbn10,bookname,author,publisher,genre,";
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
  if (getVal('inState') == '2') {
    mySql += ",'了'";
  } else if (getVal('inState') == '1') {
    mySql += ",'中'";
  } else {
    mySql += ",'未'";
  }
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
  cn.Open(tDatSrc);
  var mySql = "DELETE FROM " + tSchema + "app_booklog WHERE isbn13 = '" + num13 + "'";
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
  $('#inIsbn13').css('backgroundColor','#FFFFFF');
  $('#inBookname').css('backgroundColor','#FFFFFF');
  $('#inIssuedate').css('backgroundColor','#FFFFFF');
  $('#inGetdate').css('backgroundColor','#FFFFFF');
  $('#inReaddate').css('backgroundColor','#FFFFFF');
  $('#inPurchase').css('backgroundColor','#FFFFFF');
  if (num13 == '') { return atError ( 'inIsbn13', '書名は、必須入力項目です！ '); }
  if (getVal('inBookname') == 'null') { return atError ( 'inBookname', '書名は、必須入力項目です！ '); }
  if ( !isDate($('#inIssuedate').val())) { 
    return atError ( 'inIssuedate', '発行日の日付形式が正しくありません！ ' + getVal('inIssuedate'));
  }
  if (getVal('inGetdate') == 'null') { return atError ( 'inGetdate', '入手日は、必須入力項目です！'); }
  if ( !isDate($('#inGetdate').val())) { 
    return atError ( 'inGetdate', '入手日の日付形式が正しくありません！ ' + getVal('inGetdate'));
  }
  if ( !isDate($('#inReaddate').val())) { 
    return atError ( 'inReaddate', '読了日の日付形式が正しくありません！ ' + getVal('inReaddate'));
  }
  if ( isNaN(getVal('inPurchase')) ) { return atError ( 'inPurchase', '数値を入力してください！'); }
  return true;
}
function atError ( str, msg ) {
  alert(msg);
  $('#' + str).focus();
  $('#' + str).css('backgroundColor','mistyrose');
  return false;
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
