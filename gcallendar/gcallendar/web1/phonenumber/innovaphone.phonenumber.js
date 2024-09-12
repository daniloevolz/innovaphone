/*---------------------------------------------------------------------------*/
/* innovaphone.phonenumber.js                                                */
/* A collection of phonenumber related functions                             */
/*---------------------------------------------------------------------------*/

var innovaphone = innovaphone || {};
innovaphone.phonenumber = innovaphone.phonenumber || (function () {

    const countryCodes = [1, 20, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 27, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 30, 31, 32, 33, 34, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 36, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 39, 40, 41, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 43, 44, 45, 46, 47, 48, 49, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 51, 52, 53, 54, 55, 56, 57, 58, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 599, 60, 61, 62, 63, 64, 65, 66, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 7, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 81, 82, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 84, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859, 86, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 90, 91, 92, 93, 94, 95, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977, 978, 979, 98, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999];
    var ccEntryPoints = [null, null, null, null, null, null, null, null, null, null]; // countryCodes starting with 0,1,2,3,...
    for (var i = 0; i < countryCodes.length; i++) {
        var countryCode = countryCodes[i].toString();
        var firstDigit = Number(countryCode[0]);
        if (ccEntryPoints[firstDigit] == null) ccEntryPoints[firstDigit] = i;
    }

    function checkCountryCode (num) {
        // returns length of country code or zero if no country code matches
        if (num.charAt(0) == '+' || num.charAt(0) == 'I') {
            num = num.substr(1);
        }
        var firstDigit = Number(num.charAt(0));
        var EntryPoint = ccEntryPoints[firstDigit];
        if (EntryPoint) {
            for (var i = EntryPoint; i < countryCodes.length; i++) {
                var cc = countryCodes[i].toString();
                if (num.startsWith(cc)) return cc.length;
            }
        }
        return 0;
    }

    function readPhoneNumber(text, prefixIntl) {
        // split by decoration characters (space,brackets,dash,slash,dot,colon,semicolon,carriagereturn,linefeed,generalpunctuation)
        var ar = text.split(/[ \(\)\-\/.:;\r\n\u2000-\u206F]/);

        // remove any zero-length parts
        ar = ar.filter(function (elem) { return (elem !== "") })

        // rebuilt number string without decoration characters
         var num = ar.join("");

        // remove zero behind country code
        var prefixLen = null;
        if (num.startsWith("+") || num.startsWith("I")) prefixLen = 1;
        else if (prefixIntl && num.startsWith(prefixIntl)) prefixLen = prefixIntl.length;
        if (prefixLen) {
            var ccLen = checkCountryCode(num.substr(prefixLen));
            if (ccLen) {
                var cc = num.substr(prefixLen, ccLen);
                if (cc != "39" && cc != "242" && num.charAt(prefixLen + ccLen) == "0") {
                    num = num.substr(0, prefixLen + ccLen) + num.substr(prefixLen + ccLen + 1);
                }
            }
        }

        return num;
    }

    // public interface
    return {
        readPhoneNumber: readPhoneNumber
    };
}());
