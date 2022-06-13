namespace Termo.API
{
    public class ExternalHttpService
    {
        private readonly HttpClient _httpClient;

        public ExternalHttpService()
        {
            _httpClient = new HttpClient();
        }

        public async Task<List<string>> GetWords()
        {
            var response = await _httpClient.GetAsync("https://raw.githubusercontent.com//fserb/pt-br/master/palavras");

            var concatedWords = await response.Content.ReadAsStringAsync();
            var words = concatedWords.Split("\n").Where(c => c.Length == 5).ToList();

            return words;
        }
    }
}