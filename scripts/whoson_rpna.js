function IsLiveChatAvailable()
{
   return true;

}

function GetLiveChatHref()
{
  return "http://renlearn.co.kr/userqna";
}

function StartLiveChat()
{
 window.open(GetLiveChatHref(), 'new_win', 'width=800,height=800,location=yes,scrollbars=yes,resizable=yes,titlebar=yes');
}

